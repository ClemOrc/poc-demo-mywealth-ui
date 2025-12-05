import { gql } from '@apollo/client';

/**
 * Mutation to approve an agreement and change its status to ACTIVE
 */
export const APPROVE_AGREEMENT = gql`
  mutation ApproveAgreement($agreementId: ID!) {
    approveAgreement(agreementId: $agreementId) {
      id
      status
      updatedAt
    }
  }
`;

/**
 * Mutation to decline an agreement and change its status to EXPIRED
 */
export const DECLINE_AGREEMENT = gql`
  mutation DeclineAgreement($agreementId: ID!, $reason: String) {
    declineAgreement(agreementId: $agreementId, reason: $reason) {
      id
      status
      updatedAt
    }
  }
`;