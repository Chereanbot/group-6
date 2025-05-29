# DULAS Database Models Documentation

## Table of Contents
1. [User Management System](#user-management-system)
2. [Case Management System](#case-management-system)
3. [Service Management System](#service-management-system)
4. [Document Management System](#document-management-system)
5. [Communication System](#communication-system)
6. [Workflow Management System](#workflow-management-system)
7. [Location Management System](#location-management-system)
8. [Office Management System](#office-management-system)

## User Management System

### User Model
```prisma
model User {
  id String @id
  email String @unique
  phone String? @unique
  password String
  fullName String
  userRole UserRoleEnum
  status UserStatus
  // ... other fields
}
```

#### Relationships
- **One-to-One**
  - `LawyerProfile` (if user is a lawyer)
  - `Coordinator` (if user is a coordinator)
  - `ClientProfile` (if user is a client)
  - `Role` (user's role)

- **One-to-Many**
  - `Activity` (user activities)
  - `Notification` (user notifications)
  - `Document` (uploaded documents)
  - `Case` (as client or lawyer)
  - `ServiceRequest` (service requests)
  - `Message` (sent/received messages)

#### Behaviors
- Cascade deletion for related profiles
- Automatic timestamp updates
- Status tracking
- Activity logging

#### Key Attributes
- `email`: Unique identifier
- `phone`: Optional unique identifier
- `userRole`: Role enumeration
- `status`: User status tracking
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Role Model
```prisma
model Role {
  id String @id
  name String @unique
  description String?
  users User[]
  permissions RolePermission[]
}
```

#### Relationships
- **One-to-Many**
  - `User` (users with this role)
  - `RolePermission` (permissions for this role)

#### Behaviors
- Role-based access control
- Permission management
- User assignment

## Case Management System

### Case Model
```prisma
model Case {
  id String @id
  title String
  description String?
  status CaseStatus
  priority Priority
  category CaseCategory
  // ... other fields
}
```

#### Relationships
- **Many-to-One**
  - `User` (client and lawyer)
  - `Office` (assigned office)
  - `Kebele` (location)

- **One-to-Many**
  - `CaseDocument` (case documents)
  - `CaseActivity` (case activities)
  - `CaseNote` (case notes)
  - `Appeal` (case appeals)
  - `TimeEntry` (time tracking)
  - `WorkAssignment` (work assignments)

#### Behaviors
- Status tracking
- Priority management
- Document management
- Activity logging
- Time tracking
- Appeal handling

#### Key Attributes
- `title`: Case title
- `status`: Current status
- `priority`: Priority level
- `category`: Case category
- `complexityScore`: Case complexity
- `riskLevel`: Risk assessment
- `expectedResolutionDate`: Expected completion date

## Service Management System

### ServiceRequest Model
```prisma
model ServiceRequest {
  id String @id
  clientId String
  packageId String
  status RequestStatus
  priority Priority
  // ... other fields
}
```

#### Relationships
- **Many-to-One**
  - `User` (client and assigned lawyer)
  - `ServicePackage` (service type)

- **One-to-Many**
  - `ServiceDocument` (service documents)
  - `ServiceActivity` (service activities)
  - `ServiceNote` (service notes)
  - `Payment` (service payments)
  - `Appointment` (service appointments)
  - `Reminder` (service reminders)

#### Behaviors
- Status tracking
- Payment processing
- Document management
- Activity logging
- Reminder system
- Appointment scheduling

#### Key Attributes
- `status`: Request status
- `priority`: Priority level
- `progress`: Completion progress
- `quotedPrice`: Initial price
- `finalPrice`: Final price
- `paymentStatus`: Payment tracking

## Document Management System

### Document Model
```prisma
model Document {
  id String @id
  title String
  type DocumentType
  status DocumentStatus
  path String
  // ... other fields
}
```

#### Relationships
- **Many-to-One**
  - `User` (uploaded by)
  - `Kebele` (location)

- **One-to-Many**
  - `ServiceDocument` (service related)
  - `CoordinatorDocument` (coordinator related)
  - `QualificationDocument` (qualification related)
  - `CoordinatorHistory` (history tracking)

#### Behaviors
- Version control
- Status tracking
- Access control
- History tracking
- Type validation

#### Key Attributes
- `title`: Document title
- `type`: Document type
- `status`: Current status
- `path`: Storage path
- `size`: File size
- `mimeType`: File type

## Communication System

### Message Model
```prisma
model Message {
  id String @id
  subject String?
  text String
  senderId String
  recipientId String?
  // ... other fields
}
```

#### Relationships
- **Many-to-One**
  - `User` (sender and recipient)
  - `Chat` (belongs to chat)
  - `MessageThread` (thread participation)

- **One-to-Many**
  - `Attachment` (message attachments)
  - `MessageReaction` (message reactions)
  - `MessageNotification` (message notifications)

#### Behaviors
- Real-time delivery
- Attachment handling
- Reaction tracking
- Notification management
- Thread management

#### Key Attributes
- `subject`: Message subject
- `text`: Message content
- `status`: Delivery status
- `isForwarded`: Forward status
- `createdAt`: Timestamp

## Workflow Management System

### WorkAssignment Model
```prisma
model WorkAssignment {
  id String @id
  lawyerId String
  title String
  status WorkStatus
  // ... other fields
}
```

#### Relationships
- **Many-to-One**
  - `User` (assigned lawyer)
  - `Case` (related case)

- **One-to-Many**
  - `WorkSchedule` (work schedules)
  - `WorkloadMetrics` (performance metrics)
  - `TimeEntry` (time tracking)

#### Behaviors
- Status tracking
- Time tracking
- Performance monitoring
- Schedule management
- Progress tracking

#### Key Attributes
- `title`: Assignment title
- `status`: Current status
- `priority`: Priority level
- `estimatedHours`: Time estimate
- `actualHours`: Time spent
- `progress`: Completion progress

## Location Management System

### Kebele Model
```prisma
model Kebele {
  id String @id
  kebeleNumber String
  kebeleName String
  status KebeleStatus
  // ... other fields
}
```

#### Relationships
- **One-to-One**
  - `KebeleManager` (manager assignment)

- **One-to-Many**
  - `Document` (location documents)
  - `Case` (location cases)
  - `KebeleMessage` (location messages)
  - `ClientProfile` (client locations)

#### Behaviors
- Status tracking
- Manager assignment
- Document management
- Message handling
- Client management

#### Key Attributes
- `kebeleNumber`: Unique identifier
- `kebeleName`: Location name
- `status`: Current status
- `population`: Population count
- `contactPhone`: Contact information
- `contactEmail`: Contact information

## Office Management System

### Office Model
```prisma
model Office {
  id String @id
  name String @unique
  type OfficeType
  status OfficeStatus
  // ... other fields
}
```

#### Relationships
- **One-to-Many**
  - `Coordinator` (office coordinators)
  - `Case` (office cases)
  - `LawyerProfile` (office lawyers)
  - `Resource` (office resources)
  - `OfficePerformance` (performance metrics)
  - `ClientProfile` (client assignments)

#### Behaviors
- Status tracking
- Resource management
- Performance monitoring
- Staff assignment
- Client management

#### Key Attributes
- `name`: Office name
- `type`: Office type
- `status`: Current status
- `capacity`: Staff capacity
- `contactEmail`: Contact information
- `contactPhone`: Contact information

## Common Behaviors Across Models

### Timestamp Management
- `createdAt`: Automatic creation timestamp
- `updatedAt`: Automatic update timestamp

### Status Tracking
- Status enums for state management
- Status change history
- Status validation

### Security Features
- Role-based access control
- Permission management
- Audit logging
- Activity tracking

### Data Validation
- Required field validation
- Unique constraint validation
- Enum type validation
- Relationship validation

### Cascade Operations
- Cascade deletion for related records
- Cascade updates for dependent records
- Referential integrity maintenance

### Indexing Strategy
- Primary key indexing
- Foreign key indexing
- Composite indexing for common queries
- Unique constraint indexing

### Performance Optimization
- Efficient relationship loading
- Query optimization
- Index utilization
- Cache management 