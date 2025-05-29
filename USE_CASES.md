# DULAS Use Case Documentation

## Actors

### Primary Actors
1. **Client**
   - End user seeking legal services
   - Can be individual or organization
   - Has access to client portal

2. **Lawyer**
   - Legal professional handling cases
   - Manages client cases and documents
   - Has specialized legal expertise

3. **Coordinator**
   - Manages office operations
   - Coordinates between clients and lawyers
   - Handles service requests

4. **Kebele Manager**
   - Manages location-specific operations
   - Handles local document processing
   - Coordinates with local authorities

5. **System Administrator**
   - Manages system configuration
   - Handles user management
   - Monitors system performance

### Secondary Actors
1. **Payment System**
   - Processes financial transactions
   - Handles service payments
   - Manages billing

2. **Document Storage System**
   - Manages document storage
   - Handles file uploads/downloads
   - Maintains document versions

3. **Notification System**
   - Sends alerts and notifications
   - Manages communication channels
   - Handles reminders

## Use Cases by Actor

### Client Use Cases
1. **Account Management**
   - Register account
   - Update profile
   - Reset password
   - View profile

2. **Case Management**
   - Create new case
   - View case status
   - Upload case documents
   - Track case progress
   - View case history

3. **Service Requests**
   - Request legal service
   - View service packages
   - Track service progress
   - Make payments
   - Schedule appointments

4. **Communication**
   - Send messages to lawyer
   - View notifications
   - Participate in case discussions
   - Request updates

### Lawyer Use Cases
1. **Case Management**
   - Accept case assignments
   - Update case status
   - Add case notes
   - Manage case documents
   - Track case timeline

2. **Client Management**
   - View client profiles
   - Review client history
   - Manage client communications
   - Schedule client meetings

3. **Document Management**
   - Upload legal documents
   - Review client documents
   - Generate legal documents
   - Manage document versions

4. **Work Management**
   - Track work hours
   - Update work progress
   - Manage appointments
   - View workload

### Coordinator Use Cases
1. **Service Management**
   - Process service requests
   - Assign cases to lawyers
   - Monitor service progress
   - Handle client inquiries

2. **Office Management**
   - Manage office resources
   - Track office performance
   - Handle staff assignments
   - Monitor workload distribution

3. **Client Coordination**
   - Schedule appointments
   - Coordinate client-lawyer meetings
   - Handle client complaints
   - Manage client expectations

### Kebele Manager Use Cases
1. **Location Management**
   - Manage local documents
   - Process local cases
   - Coordinate with local authorities
   - Handle local client inquiries

2. **Document Processing**
   - Verify local documents
   - Process local certificates
   - Manage local records
   - Handle document requests

### System Administrator Use Cases
1. **System Management**
   - Manage user accounts
   - Configure system settings
   - Monitor system performance
   - Handle system maintenance

2. **Security Management**
   - Manage user roles
   - Configure permissions
   - Monitor security logs
   - Handle security incidents

## Use Case Relationships

### Include Relationships
- "Process Payment" includes "Verify Payment"
- "Create Case" includes "Validate Client"
- "Upload Document" includes "Validate Document"
- "Schedule Appointment" includes "Check Availability"

### Extend Relationships
- "View Case Status" extends "Access Case"
- "Generate Report" extends "View Statistics"
- "Send Notification" extends "Update Status"
- "Process Appeal" extends "Update Case"

### Generalization Relationships
- "Legal Document" generalizes "Case Document"
- "Service Request" generalizes "Legal Service"
- "User Account" generalizes "Client Account"
- "System Notification" generalizes "Case Notification"

## Use Case Descriptions

### Primary Use Cases

#### 1. Case Management
- **Actor**: Client, Lawyer
- **Description**: Complete process of creating and managing a legal case
- **Preconditions**: User is authenticated
- **Main Flow**:
  1. Create new case
  2. Assign case to lawyer
  3. Upload case documents
  4. Track case progress
  5. Update case status
- **Postconditions**: Case is properly managed and tracked

#### 2. Service Request Processing
- **Actor**: Client, Coordinator
- **Description**: Process of requesting and managing legal services
- **Preconditions**: Client is registered
- **Main Flow**:
  1. Submit service request
  2. Review service package
  3. Process payment
  4. Assign service to lawyer
  5. Track service progress
- **Postconditions**: Service is properly assigned and tracked

#### 3. Document Management
- **Actor**: All Users
- **Description**: Management of all system documents
- **Preconditions**: User has appropriate permissions
- **Main Flow**:
  1. Upload document
  2. Verify document
  3. Store document
  4. Manage access
  5. Track versions
- **Postconditions**: Document is properly stored and managed

### Secondary Use Cases

#### 1. Payment Processing
- **Actor**: Client, Payment System
- **Description**: Handle all financial transactions
- **Preconditions**: Valid payment information
- **Main Flow**:
  1. Initiate payment
  2. Verify payment
  3. Process transaction
  4. Update records
- **Postconditions**: Payment is processed and recorded

#### 2. Notification Management
- **Actor**: All Users, Notification System
- **Description**: Handle all system notifications
- **Preconditions**: Valid notification settings
- **Main Flow**:
  1. Generate notification
  2. Send notification
  3. Track delivery
  4. Update status
- **Postconditions**: Notification is delivered and tracked 