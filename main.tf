# define provider
provider "aws" {
    profile = "default"
}

#Create Cognito User Pool
resource "aws_cognito_user_pool" "generic_user_pool" {
    name = var.user_pool_name

    schema {
      name = "email"
      attribute_data_type = "String"
      required = true
      mutable = false
    }

    auto_verified_attributes = ["email"]

    password_policy {
      minimum_length = 8
      require_lowercase = true
      require_numbers = true
      require_symbols = true
      require_uppercase = true
    }
}

#Create Cognito User Pool Client
resource "aws_cognito_user_pool_client" "generic_user_pool_client" {
    user_pool_id = aws_cognito_user_pool.generic_user_pool.id
    name = var.user_pool_client_name

    explicit_auth_flows = [
        "ALLOW_USER_PASSWORD_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH",
        "ALLOW_USER_SRP_AUTH",
        "ALLOW_ADMIN_USER_PASSWORD_AUTH"
    ]
    generate_secret = false
}

# Create the secret for Facebook App ID
resource "aws_secretsmanager_secret" "facebook_app_secret" {
  name = var.facebook_app_id_secret
}

resource "aws_secretsmanager_secret_version" "facebook_app_secret_version" {
  secret_id = aws_secretsmanager_secret.facebook_app_secret.id
  secret_string = jsonencode({
    facebook_app_id = var.facebook_app_id
  })
}

# Create the secret for Google Client ID
resource "aws_secretsmanager_secret" "google_client_secret" {
  name = var.google_client_id_secret
}

resource "aws_secretsmanager_secret_version" "google_client_secret_version" {
  secret_id = aws_secretsmanager_secret.google_client_secret.id
  secret_string = jsonencode({
    google_client_id = var.google_client_id
  })
}

# Retrieve the secret from AWS Secrets Manager
data "aws_secretsmanager_secret" "facebook_app_secret" {
  name = aws_secretsmanager_secret.facebook_app_secret.name
  depends_on = [aws_secretsmanager_secret.facebook_app_secret]
}

data "aws_secretsmanager_secret_version" "facebook_app_secret_version" {
  secret_id = data.aws_secretsmanager_secret.facebook_app_secret.id
  depends_on = [aws_secretsmanager_secret_version.facebook_app_secret_version]
}

data "aws_secretsmanager_secret" "google_client_secret" {
  name = aws_secretsmanager_secret.google_client_secret.name
  depends_on = [aws_secretsmanager_secret.google_client_secret]
}

data "aws_secretsmanager_secret_version" "google_client_secret_version" {
  secret_id = data.aws_secretsmanager_secret.google_client_secret.id
  depends_on = [aws_secretsmanager_secret_version.google_client_secret_version]
}

# Create Cognito Identity Pool
resource "aws_cognito_identity_pool" "generic_identity_pool" {
    identity_pool_name = var.identity_pool_name
    allow_unauthenticated_identities = false

    cognito_identity_providers {
      client_id = aws_cognito_user_pool_client.generic_user_pool_client.id
      provider_name = aws_cognito_user_pool.generic_user_pool.endpoint
      server_side_token_check = true
    }

    supported_login_providers = {
        "graph.facebook.com" = jsondecode(data.aws_secretsmanager_secret_version.facebook_app_secret_version.secret_string)["facebook_app_id"]
        "account.google.com" = jsondecode(data.aws_secretsmanager_secret_version.google_client_secret_version.secret_string)["google_client_id"]
    }
}

# IAM Role for Authenticated Users
resource "aws_iam_role" "authenticated_role" {
    name = var.Cognito_Authenticated_Role

    assume_role_policy = jsonencode({
        Version = "2012-10-17",
        Statement = [ 
            {
                Effect = "Allow",
                Principal = {
                    Federated = "cognito-identity.amazonaws.com"
                },
                Action = "sts:AssumeRoleWithWebIdentity",
                Condition = {
                    "StringEquals" = {
                        "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.generic_identity_pool.id
                    },
                    "ForAnyValue:StringLike" = {
                        "cognito-identity.amazonaws.com:amr" = "authenticated"
                    }
                }
            }
        ]
    })
}

#Attach Policies to Authenticated Role
resource "aws_iam_role_policy_attachment" "authenticated_policy" {
  role = aws_iam_role.authenticated_role.name
  policy_arn =   "arn:aws:iam::aws:policy/AmazonCognitoPowerUser"
  
}

#Attach Role to Identity Pool
resource "aws_cognito_identity_pool_roles_attachment" "identity_pool_roles" {
    identity_pool_id = aws_cognito_identity_pool.generic_identity_pool.id
    roles = {
        "authenticated" = aws_iam_role.authenticated_role.arn
    }
}

