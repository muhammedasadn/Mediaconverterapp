# ----------------------------------------------------------------------------
# Universal Media Converter — Oracle Cloud Always Free Production Infrastructure
# Strictly Enforces $0/Month Architecture: 2 OCPU, 12 GB RAM, 180 GB Storage
# ----------------------------------------------------------------------------

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
}

provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}

# 1. Virtual Cloud Network (VCN)
resource "oci_core_vcn" "converter_vcn" {
  compartment_id = var.compartment_ocid
  cidr_blocks    = ["10.0.0.0/16"]
  display_name   = "universal-converter-vcn"
  dns_label      = "convvcn"
}

# 2. Internet Gateway
resource "oci_core_internet_gateway" "converter_igw" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.converter_vcn.id
  display_name   = "universal-converter-igw"
  enabled        = true
}

# 3. Default Route Table
resource "oci_core_default_route_table" "converter_route_table" {
  manage_default_resource_id = oci_core_vcn.converter_vcn.default_route_table_id

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.converter_igw.id
  }
}

# 4. Security List — Strictly allows only HTTP (80), HTTPS (443), and SSH (22)
resource "oci_core_security_list" "converter_security_list" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.converter_vcn.id
  display_name   = "universal-converter-security-list"

  # Outbound: Allow all egress traffic
  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
    stateless   = false
  }

  # Inbound: SSH (Port 22)
  ingress_security_rules {
    protocol    = "6" # TCP
    source      = "0.0.0.0/0"
    stateless   = false
    description = "SSH administrative access"

    tcp_options {
      min = 22
      max = 22
    }
  }

  # Inbound: HTTP (Port 80) — For Let's Encrypt ACME challenges & redirect to HTTPS
  ingress_security_rules {
    protocol    = "6" # TCP
    source      = "0.0.0.0/0"
    stateless   = false
    description = "HTTP / ACME Challenge"

    tcp_options {
      min = 80
      max = 80
    }
  }

  # Inbound: HTTPS (Port 443 TCP) — Caddy Reverse Proxy TLS
  ingress_security_rules {
    protocol    = "6" # TCP
    source      = "0.0.0.0/0"
    stateless   = false
    description = "HTTPS TLS API Gateway"

    tcp_options {
      min = 443
      max = 443
    }
  }

  # Inbound: HTTPS / HTTP/3 (Port 443 UDP) — Caddy HTTP/3 QUIC
  ingress_security_rules {
    protocol    = "17" # UDP
    source      = "0.0.0.0/0"
    stateless   = false
    description = "HTTP/3 QUIC Gateway"

    udp_options {
      min = 443
      max = 443
    }
  }
}

# 5. Public Subnet
resource "oci_core_subnet" "converter_subnet" {
  compartment_id    = var.compartment_ocid
  vcn_id            = oci_core_vcn.converter_vcn.id
  cidr_block        = "10.0.1.0/24"
  display_name      = "universal-converter-public-subnet"
  dns_label         = "convsub"
  security_list_ids = [oci_core_security_list.converter_security_list.id]
}

# Data source for Ubuntu 24.04 ARM64 Minimal / Standard Image
data "oci_core_images" "ubuntu_arm" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "24.04"
  shape                    = "VM.Standard.A1.Flex"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

# Data source for Availability Domains in Home Region
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.compartment_ocid
}

# 6. Always Free Compute Instance (VM.Standard.A1.Flex)
resource "oci_core_instance" "converter_instance" {
  compartment_id      = var.compartment_ocid
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = var.instance_name
  shape               = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = var.ocpu_count       # Strictly 2
    memory_in_gbs = var.memory_in_gbs   # Strictly 12
  }

  source_details {
    source_type             = "image"
    source_id               = data.oci_core_images.ubuntu_arm.images[0].id
    boot_volume_size_in_gbs = var.boot_volume_size_in_gbs # Strictly 180
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.converter_subnet.id
    assign_public_ip = true
    hostname_label   = "converter-api"
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data           = base64encode(file("${path.module}/../cloud-init/cloud-init.yaml"))
  }

  freeform_tags = {
    "Project"     = "UniversalMediaConverter"
    "Environment" = "Production"
    "CostCenter"  = "AlwaysFree-ZeroCost"
  }

  lifecycle {
    prevent_destroy = false
    ignore_changes = [
      source_details[0].source_id
    ]
  }
}
