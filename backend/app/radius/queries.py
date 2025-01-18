"""GraphQL queries for the RADIUS API"""

GET_PROFILE = """
query GetProfile($name: String!) {
    profile(name: $name) {
        name
        serviceType
        description
        rateLimit {
            rxRate
            txRate
            burstRxRate
            burstTxRate
            burstThresholdRx
            burstThresholdTx
            burstTime
        }
        ipPool
    }
}
"""

GET_ALL_PROFILES = """
query {
    profiles {
        name
        serviceType
        description
        rateLimit {
            rxRate
            txRate
            burstRxRate
            burstTxRate
            burstThresholdRx
            burstThresholdTx
            burstTime
        }
        ipPool
    }
}
"""

GET_PROFILE_USERS = """
query GetProfileUsers($profileName: String!) {
    profileUsers(profileName: $profileName) {
        username
        profileName
        priority
    }
}
"""

CREATE_PROFILE = """
mutation CreateProfile($profile: ProfileCreateInput!) {
    createProfile(profile: $profile) {
        name
        serviceType
        description
        rateLimit {
            rxRate
            txRate
            burstRxRate
            burstTxRate
            burstThresholdRx
            burstThresholdTx
            burstTime
        }
        ipPool
    }
}
"""

UPDATE_PROFILE = """
mutation UpdateProfile($name: String!, $profile: ProfileUpdateInput!) {
    updateProfile(name: $name, profile: $profile) {
        name
        serviceType
        description
        rateLimit {
            rxRate
            txRate
            burstRxRate
            burstTxRate
            burstThresholdRx
            burstThresholdTx
            burstTime
        }
        ipPool
    }
}
"""

DELETE_PROFILE = """
mutation DeleteProfile($name: String!) {
    deleteProfile(name: $name)
}
"""

ASSIGN_PROFILE_TO_USER = """
mutation AssignProfileToUser($input: AssignProfileInput!) {
    assignProfileToUser(input: $input) {
        username
        profileName
        priority
    }
}
"""

REMOVE_PROFILE_FROM_USER = """
mutation RemoveProfileFromUser($username: String!, $profileName: String!) {
    removeProfileFromUser(username: $username, profileName: $profileName)
}
""" 