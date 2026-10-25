import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  UserCheck,
  UserX,
  AlertCircle,
  GraduationCap,
  Phone,
  Mail,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    classGrade: 'Grade 10',
    phone: '',
    isActive: true,
  });

  useEffect(() => {
    fetchStudents();
  }, [selectedClass, statusFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedClass) params.classGrade = selectedClass;
      if (statusFilter !== '') params.isActive = statusFilter;

      const res = await api.get('/students', { params });
      setStudents(res.data.students || []);
    } catch (err) {
      setError('Failed to retrieve student directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      studentId: `STU${100 + students.length + 1}`,
      classGrade: 'Grade 10',
      phone: '',
      isActive: true,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (student) => {
    setCurrentStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      studentId: student.studentId || '',
      classGrade: student.classGrade || 'Grade 10',
      phone: student.phone || '',
      isActive: student.isActive,
    });
    setShowEditModal(true);
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', {
        ...formData,
        role: 'student',
      });
      setShowAddModal(false);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating student account');
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/students/${currentStudent._id}`, formData);
      setShowEditModal(false);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating student account');
    }
  };

  const toggleStudentStatus = async (student) => {
    try {
      await api.put(`/students/${student._id}`, {
        isActive: !student.isActive,
      });
      fetchStudents();
    } catch (err) {
      alert('Error changing student account status');
    }
  };

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      (s.studentId && s.studentId.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Student Management
          </span>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Enrolled Students Roster
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, update, manage access credentials, and review individual progress
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-xs text-rose-700 border border-rose-200">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by student name, ID (e.g. STU102), or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="">All Classes</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="General">General</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading student directory...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No student accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Student ID</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Phone / WhatsApp</th>
                  <th className="px-6 py-4">Exams Taken</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((stu) => (
                  <tr key={stu._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                          {stu.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">{stu.name}</span>
                          <span className="text-xs text-slate-400">{stu.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">
                      {stu.studentId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {stu.classGrade}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                      {stu.phone || '—'}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                      {stu.totalAttempts} Exams
                      {stu.failedAttempts > 0 && (
                        <span className="ml-1.5 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-200">
                          {stu.failedAttempts} Fail
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                          stu.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            stu.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {stu.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/student/progress`}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
                          title="View Progress"
                        >
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(stu)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
                          title="Edit Details"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleStudentStatus(stu)}
                          className={`rounded-lg border p-1.5 transition ${
                            stu.isActive
                              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={stu.isActive ? 'Deactivate Student' : 'Activate Student'}
                        >
                          {stu.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Student"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Student Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student ID</label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="STU105"
                className="w-full rounded-xl border border-slate-300 p-2.5 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Class / Grade</label>
              <input
                type="text"
                required
                value={formData.classGrade}
                onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                placeholder="Grade 10"
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@example.com"
              className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              WhatsApp Phone Number (Optional)
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 9876543210"
              className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Student Account"
      >
        <form onSubmit={handleUpdateStudent} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Student Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student ID</label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Class / Grade</label>
              <input
                type="text"
                required
                value={formData.classGrade}
                onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActiveCheck" className="text-xs font-semibold text-slate-700">
              Account Active (Permitted to take exams)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
