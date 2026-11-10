output "instance_public_ip" {
  description = "Public IP address of the Always Free Oracle Cloud VM."
  value       = oci_core_instance.converter_instance.public_ip
}

output "instance_ocid" {
  description = "OCID of the provisioned VM instance."
  value       = oci_core_instance.converter_instance.id
}

output "ssh_command" {
  description = "SSH connection command for the instance."
  value       = "ssh -i <your-private-key> ubuntu@${oci_core_instance.converter_instance.public_ip}"
}

output "dns_setup_instructions" {
  description = "Instructions for configuring Cloudflare DNS."
  value       = "In Cloudflare DNS, create an 'A' record: Host 'api' -> Value '${oci_core_instance.converter_instance.public_ip}', Proxy Status: 'DNS only' (Grey Cloud)."
}
