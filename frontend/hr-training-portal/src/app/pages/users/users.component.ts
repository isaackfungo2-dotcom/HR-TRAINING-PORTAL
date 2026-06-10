import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserDto, DepartmentDto, RegisterRequest } from '../../models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-title">Users & Roles</div>

    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
        <h3 style="margin:0;">All Users</h3>
        <button class="btn-aqua" (click)="openAdd()">+ Add User</button>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Supervisor</th>
              <th>Status</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td>{{ u.firstName }} {{ u.lastName }}</td>
              <td>{{ u.email }}</td>
              <td>
                <select [(ngModel)]="u.role" (change)="changeRole(u, $any($event.target).value)" class="role-select">
                  <option value="EMPLOYEE">Employee</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="HR">HR</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </td>
              <td>{{ u.departmentName || '-' }}</td>
              <td>{{ u.supervisorName || '-' }}</td>
              <td>
                <span class="status-badge" [ngClass]="u.active ? 'status-hr-approved' : 'status-rejected'">
                  {{ u.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td style="text-align:right;">
                <button class="btn-aqua btn-sm" (click)="openEdit(u)">Edit</button>
                <button class="btn-aqua btn-sm" [class.btn-danger]="u.active" (click)="toggleActive(u)">
                  {{ u.active ? 'Deactivate' : 'Activate' }}
                </button>
                <button class="btn-aqua btn-sm btn-danger" (click)="deleteUser(u.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div *ngIf="users.length === 0" style="text-align:center; color:#6b7280; padding:20px;">No users found.</div>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()"></div>
    <div class="modal" *ngIf="showModal">
      <div class="modal-header">
        <h3 style="margin:0;">{{ editingId ? 'Edit User' : 'Add User' }}</h3>
        <button class="modal-close" (click)="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label>First Name</label>
            <input [(ngModel)]="form.firstName" placeholder="First name" />
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input [(ngModel)]="form.lastName" placeholder="Last name" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Email</label>
            <input [(ngModel)]="form.email" placeholder="Email" />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input [(ngModel)]="form.phone" placeholder="Phone" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Password {{ editingId ? '(leave blank to keep)' : '' }}</label>
            <input type="password" [(ngModel)]="form.password" placeholder="Password" />
          </div>
          <div class="form-group">
            <label>Role</label>
            <select [(ngModel)]="form.role">
              <option value="EMPLOYEE">Employee</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="HR">HR</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Department</label>
            <select [(ngModel)]="form.departmentId">
              <option [ngValue]="undefined">-- None --</option>
              <option *ngFor="let d of departments" [ngValue]="d.id">{{ d.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Supervisor</label>
            <select [(ngModel)]="form.supervisorId">
              <option [ngValue]="undefined">-- None --</option>
              <option *ngFor="let s of supervisors" [ngValue]="s.id">{{ s.firstName }} {{ s.lastName }}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group" style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="active" [(ngModel)]="form.active" />
            <label for="active" style="margin:0;">Active</label>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-aqua" (click)="save()">{{ editingId ? 'Update' : 'Create' }}</button>
        <button class="btn-aqua btn-secondary" (click)="closeModal()">Cancel</button>
      </div>
    </div>
  `,
  styles: [`
    .btn-sm { padding: 4px 10px; font-size: .8rem; margin-left: 4px; }
    .btn-danger { background: #dc2626; }
    .btn-danger:hover { background: #b91c1c; }
    .btn-secondary { background: #6b7280; }
    .btn-secondary:hover { background: #4b5563; }
    .role-select { padding: 4px 8px; border-radius: 6px; border: 1px solid #d1d5db; font-size: .85rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px; }
    @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }

    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 100;
    }
    .modal {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: #fff; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      z-index: 101; width: 90%; max-width: 520px; max-height: 90vh; overflow: auto;
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 18px; border-bottom: 1px solid #e5e7eb;
    }
    .modal-close {
      background: transparent; border: none; font-size: 1.4rem; cursor: pointer; color: #6b7280;
    }
    .modal-body { padding: 16px 18px; }
    .modal-footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 12px 18px; border-top: 1px solid #e5e7eb;
    }
  `]
})
export class UsersComponent implements OnInit {
  users: UserDto[] = [];
  departments: DepartmentDto[] = [];
  supervisors: UserDto[] = [];
  showModal = false;
  editingId: number | null = null;
  form: any = {};

  constructor(private userService: UserService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadUsers();
    this.loadDepartments();
  }

  loadUsers() {
    this.userService.getAll().subscribe({
      next: list => {
        this.users = list;
        this.supervisors = list.filter(u => u.role === 'SUPERVISOR' || u.role === 'HR' || u.role === 'ADMIN');
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Failed to load users', err);
        alert('Failed to load users. Please ensure you are logged in as Admin.');
      }
    });
  }

  loadDepartments() {
    this.userService.getDepartments().subscribe(list => this.departments = list);
  }

  openAdd() {
    this.editingId = null;
    this.form = { role: 'EMPLOYEE', active: true };
    this.showModal = true;
  }

  openEdit(u: UserDto) {
    this.editingId = u.id;
    this.form = {
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      departmentId: u.departmentId,
      supervisorId: u.supervisorId,
      password: '',
      active: u.active
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.form = {};
    this.editingId = null;
  }

  save() {
    const payload: RegisterRequest = {
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      password: this.form.password,
      role: this.form.role,
      departmentId: this.form.departmentId,
      supervisorId: this.form.supervisorId,
      phone: this.form.phone,
      active: this.form.active
    };
    if (this.editingId) {
      this.userService.update(this.editingId, payload).subscribe(() => {
        this.closeModal();
        this.loadUsers();
      });
    } else {
      this.userService.create(payload).subscribe(() => {
        this.closeModal();
        this.loadUsers();
      });
    }
  }

  deleteUser(id: number) {
    if (!confirm('Are you sure you want to delete this user? They will be deactivated.')) return;
    this.userService.delete(id).subscribe(() => this.loadUsers());
  }

  toggleActive(u: UserDto) {
    const next = !u.active;
    const action = next ? 'activate' : 'deactivate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    this.userService.setActive(u.id, next).subscribe(() => this.loadUsers());
  }

  changeRole(u: UserDto, newRole: string) {
    const payload: RegisterRequest = {
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      password: '',
      role: newRole,
      departmentId: u.departmentId,
      supervisorId: u.supervisorId,
      phone: u.phone
    };
    this.userService.update(u.id, payload).subscribe(() => this.loadUsers());
  }
}
