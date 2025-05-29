# DULAS Database Specifications

## Database Overview
- **Database Type**: MongoDB
- **Version**: Latest stable version
- **Deployment**: Cloud-hosted
- **Backup Strategy**: Daily automated backups
- **Replication**: Primary-Secondary setup

## Database Collections

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  phone: String (unique, optional),
  password: String (hashed, required),
  fullName: String (required),
  userRole: Enum ['CLIENT', 'LAWYER', 'COORDINATOR', 'KEBELE_MANAGER', 'ADMIN'],
  status: Enum ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
  profile: {
    address: String,
    city: String,
    state: String,
    country: String,
    profilePicture: String (URL)
  },
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

### 2. Cases Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  status: Enum ['NEW', 'IN_PROGRESS', 'PENDING', 'COMPLETED', 'CLOSED'],
  priority: Enum ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
  category: Enum ['CIVIL', 'CRIMINAL', 'FAMILY', 'CORPORATE', 'OTHER'],
  clientId: ObjectId (ref: 'Users'),
  lawyerId: ObjectId (ref: 'Users'),
  officeId: ObjectId (ref: 'Offices'),
  kebeleId: ObjectId (ref: 'Kebeles'),
  documents: [{
    documentId: ObjectId (ref: 'Documents'),
    type: String,
    uploadedAt: Date
  }],
  timeline: [{
    action: String,
    description: String,
    performedBy: ObjectId (ref: 'Users'),
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 3. ServiceRequests Collection
```javascript
{
  _id: ObjectId,
  clientId: ObjectId (ref: 'Users'),
  packageId: ObjectId (ref: 'ServicePackages'),
  status: Enum ['PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  priority: Enum ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
  progress: Number (0-100),
  quotedPrice: Number,
  finalPrice: Number,
  paymentStatus: Enum ['PENDING', 'PARTIAL', 'COMPLETED'],
  appointments: [{
    date: Date,
    type: String,
    status: String,
    notes: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Documents Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  type: Enum ['CASE_DOCUMENT', 'LEGAL_DOCUMENT', 'CERTIFICATE', 'OTHER'],
  status: Enum ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'],
  path: String (required),
  size: Number,
  mimeType: String,
  uploadedBy: ObjectId (ref: 'Users'),
  kebeleId: ObjectId (ref: 'Kebeles'),
  version: Number,
  metadata: {
    originalName: String,
    description: String,
    tags: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Offices Collection
```javascript
{
  _id: ObjectId,
  name: String (unique, required),
  type: Enum ['MAIN', 'BRANCH', 'TEMPORARY'],
  status: Enum ['ACTIVE', 'INACTIVE', 'CLOSED'],
  address: {
    street: String,
    city: String,
    state: String,
    country: String
  },
  contact: {
    email: String,
    phone: String
  },
  capacity: Number,
  resources: [{
    type: String,
    quantity: Number,
    status: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Kebeles Collection
```javascript
{
  _id: ObjectId,
  kebeleNumber: String (unique, required),
  kebeleName: String (required),
  status: Enum ['ACTIVE', 'INACTIVE'],
  managerId: ObjectId (ref: 'Users'),
  population: Number,
  contact: {
    email: String,
    phone: String
  },
  location: {
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    address: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

### Primary Indexes
- Users: `email`, `phone`
- Cases: `clientId`, `lawyerId`, `status`
- ServiceRequests: `clientId`, `status`
- Documents: `uploadedBy`, `type`
- Offices: `name`
- Kebeles: `kebeleNumber`

### Secondary Indexes
- Cases: `createdAt`, `priority`
- ServiceRequests: `createdAt`, `paymentStatus`
- Documents: `createdAt`, `status`
- Users: `userRole`, `status`

## Data Validation Rules

### Users Collection
- Email must be unique and valid format
- Phone number must be unique if provided
- Password must be hashed
- UserRole must be one of the defined enum values
- Status must be one of the defined enum values

### Cases Collection
- Title must not be empty
- Status must be one of the defined enum values
- Priority must be one of the defined enum values
- Category must be one of the defined enum values
- ClientId and LawyerId must reference valid Users

### ServiceRequests Collection
- ClientId must reference valid Users
- PackageId must reference valid ServicePackages
- Status must be one of the defined enum values
- Progress must be between 0 and 100
- PaymentStatus must be one of the defined enum values

## Security Measures

### Access Control
- Role-based access control (RBAC)
- Document-level security
- Field-level security
- IP whitelisting for admin access

### Data Protection
- Password hashing using bcrypt
- Data encryption at rest
- Secure communication (TLS/SSL)
- Regular security audits

### Backup and Recovery
- Daily automated backups
- Point-in-time recovery
- Disaster recovery plan
- Data retention policies

## Performance Optimization

### Query Optimization
- Index usage monitoring
- Query performance tracking
- Regular index maintenance
- Query caching

### Storage Optimization
- Data compression
- Archival strategy
- Regular cleanup of temporary data
- Efficient data modeling

## Monitoring and Maintenance

### Health Checks
- Database connection monitoring
- Performance metrics tracking
- Error rate monitoring
- Resource utilization tracking

### Maintenance Tasks
- Regular index rebuilding
- Data consistency checks
- Log rotation
- Performance optimization

## Data Migration Strategy

### Version Control
- Schema version tracking
- Migration scripts
- Rollback procedures
- Data validation

### Backup Strategy
- Full database backups
- Incremental backups
- Backup verification
- Recovery testing 