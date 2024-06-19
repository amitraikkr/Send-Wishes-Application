variable "aws_region" {
    description = "AWS region to deploy"
    type = string
}
variable "user_pool_name" {
  description = "name of the cognito user pool name"
  type = string
}
variable "user_pool_client_name" {
    description = "name of the cognito user pool client name"
    type = string
}

variable "identity_pool_name" {
    description = "name of the cognito identity pool name"
    type = string
}

variable "facebook_app_id" {
  description = "Facebook App ID"
  type        = string
}

variable "google_client_id" {
  description = "Google Client ID"
  type        = string
}

variable "facebook_app_id_secret" {
  description = "Secret Manager Facebook App ID"
  type        = string
}

variable "google_client_id_secret" {
  description = "Secret Manager Google Client ID"
  type        = string
}

variable "Cognito_Authenticated_Role" {
    description = "Cognito authenticated role name"
    type = string
}
