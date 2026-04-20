# 🔄 System Workflow

## Document Creation Flow

1. Author creates a document
2. Initial version is created
3. Version is saved in the system

---

## Version Review Flow

1. Author submits version for review
2. Status → IN_REVIEW
3. Reviewer/admin evaluates version

---

## Approval Process

- If approved:
  → Version becomes ACTIVE

- If rejected:
  → Version remains inactive

---

## Role-Based Access Control

- Author → create/edit/submit versions
- Reviewer → approve/reject
- Reader → view only APPROVED/ACTIVE versions
- Admin → Full system access, including user management and role assignment.

---

## Key Rules
- Only approved versions are visible
- All changes are tracked
- Immutability: Once a version reaches APPROVED or REJECTED status, it can never  
be modified. Any further changes require a new version number.
- Sequential Numbering: Version numbers are strictly incremental (1, 2, 3...) per document
