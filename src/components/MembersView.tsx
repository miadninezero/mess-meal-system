import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Member, Role } from '../types/index.ts';
import { TabId } from './Sidebar.tsx';
import { formatCurrency } from '../lib/calculations.ts';
import { Users, UserPlus, Phone, Mail, Shield, CheckCircle2, UserX, X, Plus } from 'lucide-react';

interface MembersViewProps {
  setActiveTab?: (tab: TabId) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({ setActiveTab }) => {
  const { members, payments, selectedMonth, addMember, updateMemberStatus, setDepositTargetMemberId, currentUser } = useApp();
  const isManager = currentUser.role === 'manager' || currentUser.role === 'admin';

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [role, setRole] = useState<Role>('member');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addMember({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      role,
      status: 'active',
      activeFrom: new Date().toISOString().split('T')[0],
    });

    setName('');
    setEmail('');
    setPhone('');
    setRole('member');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Mess Residents & Members</h1>
          <p className="text-xs text-slate-500">
            Maintain stable member records. Deactivate members when they leave without losing historical meal logs.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Members Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => {
          const isActive = m.status === 'active';
          const memberDeposits = payments
            .filter((p) => p.memberId === m.id && p.date.startsWith(selectedMonth))
            .reduce((sum, p) => sum + p.amount, 0);

          return (
            <div
              key={m.id}
              className={`bg-white border rounded-xl p-4 shadow-xs flex flex-col justify-between transition-colors ${
                isActive ? 'border-slate-200' : 'border-slate-200 bg-slate-50/60 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-tight">{m.name}</h3>
                      <span className="text-[10px] text-slate-500 capitalize">Role: {m.role}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      isActive
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-slate-500 bg-slate-100 border-slate-200'
                    }`}
                  >
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-1 pt-2 text-[11px] text-slate-600 border-t border-slate-100">
                  {m.phone && (
                    <div className="flex items-center gap-2 font-mono">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{m.phone}</span>
                    </div>
                  )}
                  {m.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{m.email}</span>
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 pt-0.5">
                    Member since {m.activeFrom}
                  </div>
                </div>

                {/* Per-member deposit status for selected month */}
                <div className="mt-3 p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Deposited ({selectedMonth})</span>
                    <span className="text-xs font-bold font-mono text-slate-900">{formatCurrency(memberDeposits)}</span>
                  </div>
                  {isActive && isManager && (
                    <button
                      type="button"
                      onClick={() => {
                        setDepositTargetMemberId(m.id);
                        setActiveTab?.('payments');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                      title={`Add deposit for ${m.name}`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Deposit</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">ID: {m.id}</span>
                {isActive ? (
                  <button
                    onClick={() => updateMemberStatus(m.id, 'inactive')}
                    className="text-[11px] font-medium text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => updateMemberStatus(m.id, 'active')}
                    className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Add New Resident Member</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahfuzur Rahman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number:</label>
                <input
                  type="text"
                  placeholder="+880 1700-000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address:</label>
                <input
                  type="email"
                  placeholder="member@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Role:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                >
                  <option value="member">Resident Member</option>
                  <option value="manager">Mess Manager</option>
                  <option value="admin">Mess Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
