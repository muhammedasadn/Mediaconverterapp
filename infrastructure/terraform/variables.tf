# ----------------------------------------------------------------------------
# Universal Media Converter — Terraform OCI Always Free Variables
# Strict guardrails: 2 OCPUs, 12 GB RAM, 180 GB Disk max
# ----------------------------------------------------------------------------

variable "tenancy_ocid" {
  type        = string
  description = "The OCID of your OCI tenancy."
}

variable "user_ocid" {
  type        = string
  description = "The OCID of the OCI IAM user."
}

variable "fingerprint" {
  type        = string
  description = "Fingerprint for the API key."
}

variable "private_key_path" {
  type        = string
  description = "The local path to your OCI private API key."
  default     = "~/.oci/oci_api_key.pem"
}

variable "region" {
  type        = string
  description = "OCI Region. MUST BE YOUR TENANCY HOME REGION for Always Free Ampere A1."
  default     = "us-ashburn-1"
}

variable "compartment_ocid" {
  type        = string
  description = "The OCID of the compartment to contain the resources."
}

variable "ssh_public_key" {
  type        = string
  description = "SSH Public Key string injected into the VM for rootless SSH access."
}

variable "instance_name" {
  type        = string
  description = "Name tag for the Always Free VM instance."
  default     = "universal-media-converter-prod"
}

# HARD CONSTRAINTS: Explicitly locked to Always Free limits
variable "ocpu_count" {
  type        = number
  description = "Strictly locked to 2 OCPU for Always Free Ampere A1 (2 physical ARM Neoverse N1 cores)."
  default     = 2

  validation {
    condition     = var.ocpu_count <= 2
    error_message = "CRITICAL: Always Free Ampere A1 allocation is capped at 2 OCPU total. Higher values incur immediate bill charges."
  }
}

variable "memory_in_gbs" {
  type        = number
  description = "Strictly locked to 12 GB RAM for Always Free Ampere A1."
  default     = 12

  validation {
    condition     = var.memory_in_gbs <= 12
    error_message = "CRITICAL: Always Free Ampere A1 memory is capped at 12 GB total. Higher values incur immediate bill charges."
  }
}

variable "boot_volume_size_in_gbs" {
  type        = number
  description = "Boot volume disk size. Strictly kept <= 180 GB to stay under 200 GB total free tier."
  default     = 180

  validation {
    condition     = var.boot_volume_size_in_gbs <= 180
    error_message = "CRITICAL: Boot volume size must be <= 180 GB to leave headroom within the 200 GB free limit."
  }
}
