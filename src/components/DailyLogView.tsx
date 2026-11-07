import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  calculateGuestUnits,
  calculateMealUnits,
  checkFridayReviewNeeded,
  formatUnits,
  isFriday,
} from '../lib/calculations.ts';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  UserPlus,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  Info,
} from 'lucide-react';

interface MemberState {
  memberId: string;
  name: string;
  lunchAttended: boolean;
  nightAttended: boolean;
}

interface GuestItem {
  hostMemberId: string;
  guestName?: string;
  lunchCount: number;
  nightCount: number;
  note?: string;
}

export const DailyLogView: React.FC = () => {
  const {
    members,
    serviceDays,
    attendance,
    guestAttendance,
    saveDailyLog,
    saveStatus,
  } = useApp();

  // Active date selection (defaults to current date, or Nov 7 2026)
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-07');

  // Service switches
  const [lunchServed, setLunchServed] = useState<boolean>(true);
  const [nightServed, setNightServed] = useState<boolean>(true);
  const [exceptionReason, setExceptionReason] = useState<string>('');
  const [isFridayOverride, setIsFridayOverride] = useState<boolean>(false);

  // Member attendance for selected date
  const [memberAttendance, setMemberAttendance] = useState<MemberState[]>([]);

  // Guest meals for selected date
  const [guestList, setGuestList] = useState<GuestItem[]>([]);

  // Form for adding a guest
  const [newGuestHostId, setNewGuestHostId] = useState<string>('');
  const [newGuestName, setNewGuestName] = useState<string>('');
  const [newGuestLunch, setNewGuestLunch] = useState<number>(1);
  const [newGuestNight, setNewGuestNight] = useState<number>(0);
  const [newGuestNote, setNewGuestNote] = useState<string>('');
  const [showGuestForm, setShowGuestForm] = useState<boolean>(false);

  const activeMembers = useMemo(() => members.filter((m) => m.status === 'active'), [members]);

  // Load existing data whenever selectedDate changes
  useEffect(() => {
    const existingDay = serviceDays.find((s) => s.date === selectedDate);
    const dateIsFri = isFriday(selectedDate);

    if (existingDay) {
      setLunchServed(existingDay.lunchServed);
      setNightServed(existingDay.nightServed);
      setExceptionReason(existingDay.exceptionReason || '');
      setIsFridayOverride(existingDay.isFridayOverride || false);
    } else {
      // New date: if Friday, default to lunch only; otherwise both services
      if (dateIsFri) {
        setLunchServed(true);
        setNightServed(false);
        setIsFridayOverride(false);
        setExceptionReason('');
      } else {
        setLunchServed(true);
        setNightServed(true);
        setIsFridayOverride(false);
        setExceptionReason('');
      }
    }

    // Load attendance
    const dayAttendance = attendance.filter((a) => a.date === selectedDate);
    const initialMemberStates: MemberState[] = activeMembers.map((m) => {
      const existingAtt = dayAttendance.find((a) => a.memberId === m.id);
      return {
        memberId: m.id,
        name: m.name,
        lunchAttended: existingAtt ? existingAtt.lunchAttended : true,
        nightAttended: existingAtt ? existingAtt.nightAttended : !dateIsFri,
      };
    });
    setMemberAttendance(initialMemberStates);

    // Load guests
    const dayGuests = guestAttendance.filter((g) => g.date === selectedDate);
    setGuestList(
      dayGuests.map((g) => ({
        hostMemberId: g.hostMemberId,
        guestName: g.guestName,
        lunchCount: g.lunchCount,
        nightCount: g.nightCount,
        note: g.note,
      }))
    );

    if (activeMembers.length > 0 && !newGuestHostId) {
      setNewGuestHostId(activeMembers[0].id);
    }
  }, [selectedDate, serviceDays, attendance, guestAttendance, activeMembers]);

  // Day navigation helpers
  const changeDateBy = (days: number) => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + days);
    const nextY = d.getFullYear();
    const nextM = String(d.getMonth() + 1).padStart(2, '0');
    const nextD = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${nextY}-${nextM}-${nextD}`);
  };

  const getDayLabel = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const dateIsFriday = isFriday(selectedDate);
  const fridayReview = checkFridayReviewNeeded(selectedDate, lunchServed, nightServed, isFridayOverride);

  // Toggle helper
  const updateMember = (memberId: string, field: 'lunch' | 'night', value: boolean) => {
    setMemberAttendance((prev) =>
      prev.map((m) =>
        m.memberId === memberId
          ? {
              ...m,
              lunchAttended: field === 'lunch' ? value : m.lunchAttended,
              nightAttended: field === 'night' ? value : m.nightAttended,
            }
          : m
      )
    );
  };

  const toggleAll = (field: 'lunch' | 'night', value: boolean) => {
    setMemberAttendance((prev) =>
      prev.map((m) => ({
        ...m,
        lunchAttended: field === 'lunch' ? value : m.lunchAttended,
        nightAttended: field === 'night' ? value : m.nightAttended,
      }))
    );
  };

  // Add guest
  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestHostId) return;
    if (newGuestLunch <= 0 && newGuestNight <= 0) return;

    setGuestList((prev) => [
      ...prev,
      {
        hostMemberId: newGuestHostId,
        guestName: newGuestName.trim() || undefined,
        lunchCount: Number(newGuestLunch) || 0,
        nightCount: Number(newGuestNight) || 0,
        note: newGuestNote.trim() || undefined,
      },
    ]);

    setNewGuestName('');
    setNewGuestLunch(lunchServed ? 1 : 0);
    setNewGuestNight(nightServed ? 1 : 0);
    setNewGuestNote('');
    setShowGuestForm(false);
  };

  const removeGuest = (index: number) => {
    setGuestList((prev) => prev.filter((_, i) => i !== index));
  };

  // Compute live day totals
  const totalMemberUnits = memberAttendance.reduce((sum, m) => {
    return sum + calculateMealUnits(lunchServed, nightServed, m.lunchAttended, m.nightAttended);
  }, 0);

  const totalGuestUnits = guestList.reduce((sum, g) => {
    return sum + calculateGuestUnits(lunchServed, nightServed, g.lunchCount, g.nightCount);
  }, 0);

  const totalDayUnits = totalMemberUnits + totalGuestUnits;

  // Handle Save
  const handleSave = async () => {
    await saveDailyLog(
      selectedDate,
      lunchServed,
      nightServed,
      exceptionReason,
      isFridayOverride,
      memberAttendance.map((m) => ({
        memberId: m.memberId,
        lunchAttended: m.lunchAttended,
        nightAttended: m.nightAttended,
      })),
      guestList
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Date Controller */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDateBy(-1)}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="font-mono text-sm font-semibold text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <span className="text-xs font-semibold text-slate-600 hidden md:inline">
                {getDayLabel(selectedDate)}
              </span>
            </div>
            <button
              onClick={() => changeDateBy(1)}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDate('2026-11-07')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>

          {/* Quick Units Badge & Save Button */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] text-slate-500">Day Total Units:</div>
              <div className="text-sm font-bold font-mono text-slate-900">
                {formatUnits(totalDayUnits)} units
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {saveStatus === 'saving' ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Day Attendance</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Service Availability Switches Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Meal Services Actually Served</h2>
            <p className="text-xs text-slate-500">
              Weighting is calculated based on what was served that day, not merely the weekday.
            </p>
          </div>
          {dateIsFriday && (
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
              Friday (Default: Lunch only = 1 unit)
            </span>
          )}
        </div>

        {/* Friday Review Notice if Night is served without override */}
        {fridayReview.needsReview && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Friday Review Flagged: </span>
              <span>{fridayReview.message}</span>
              <div className="mt-2 flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-amber-900">
                  <input
                    type="checkbox"
                    checked={isFridayOverride}
                    onChange={(e) => setIsFridayOverride(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-amber-300 focus:ring-indigo-500"
                  />
                  <span>Confirm manager override for this Friday</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Lunch Switch */}
          <div
            onClick={() => setLunchServed(!lunchServed)}
            className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
              lunchServed
                ? 'bg-indigo-50/60 border-indigo-200 text-slate-900'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            <div>
              <div className="text-xs font-bold flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${lunchServed ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                <span>Lunch / Day Service</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {lunchServed ? 'Service was cooked and served' : 'No lunch service today'}
              </p>
            </div>
            <div
              className={`w-10 h-5 flex items-center rounded-full p-1 duration-200 ${
                lunchServed ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="bg-white w-3.5 h-3.5 rounded-full shadow-md" />
            </div>
          </div>

          {/* Night Switch */}
          <div
            onClick={() => setNightServed(!nightServed)}
            className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
              nightServed
                ? 'bg-indigo-50/60 border-indigo-200 text-slate-900'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            <div>
              <div className="text-xs font-bold flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${nightServed ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                <span>Night / Dinner Service</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {nightServed ? 'Service was cooked and served' : 'Cancelled / Not served'}
              </p>
            </div>
            <div
              className={`w-10 h-5 flex items-center rounded-full p-1 duration-200 ${
                nightServed ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="bg-white w-3.5 h-3.5 rounded-full shadow-md" />
            </div>
          </div>
        </div>

        {/* Exception Reason Input if any meal is cancelled */}
        {(!lunchServed || !nightServed) && (
          <div className="pt-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Cancellation / Exception Reason (Logged for audit transparency):
            </label>
            <input
              type="text"
              placeholder="e.g. Gas supply disrupted, chef absent, holiday schedule..."
              value={exceptionReason}
              onChange={(e) => setExceptionReason(e.target.value)}
              className="w-full text-xs text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* Member Attendance Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Member Attendance Matrix</h2>
            <p className="text-xs text-slate-500">
              Select which meals each resident ate. Weighted units calculate instantly.
            </p>
          </div>

          {/* Bulk Toggles */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">All Lunch:</span>
              <button
                type="button"
                onClick={() => toggleAll('lunch', true)}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Yes
              </button>
              <span className="text-slate-300">/</span>
              <button
                type="button"
                onClick={() => toggleAll('lunch', false)}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
              >
                No
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">All Night:</span>
              <button
                type="button"
                onClick={() => toggleAll('night', true)}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Yes
              </button>
              <span className="text-slate-300">/</span>
              <button
                type="button"
                onClick={() => toggleAll('night', false)}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
              >
                No
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Member Name</th>
                <th className="py-2.5 px-4 text-center">
                  Lunch {lunchServed ? '' : '(Not served)'}
                </th>
                <th className="py-2.5 px-4 text-center">
                  Night {nightServed ? '' : '(Not served)'}
                </th>
                <th className="py-2.5 px-4 text-right">Calculated Units</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {memberAttendance.map((m) => {
                const units = calculateMealUnits(
                  lunchServed,
                  nightServed,
                  m.lunchAttended,
                  m.nightAttended
                );

                return (
                  <tr key={m.memberId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {m.name.charAt(0)}
                        </div>
                        <span>{m.name}</span>
                      </div>
                    </td>

                    {/* Lunch Toggle */}
                    <td className="py-3 px-4 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!lunchServed}
                          checked={m.lunchAttended && lunchServed}
                          onChange={(e) => updateMember(m.memberId, 'lunch', e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 disabled:opacity-30 cursor-pointer"
                        />
                      </label>
                    </td>

                    {/* Night Toggle */}
                    <td className="py-3 px-4 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!nightServed}
                          checked={m.nightAttended && nightServed}
                          onChange={(e) => updateMember(m.memberId, 'night', e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 disabled:opacity-30 cursor-pointer"
                        />
                      </label>
                    </td>

                    {/* Calculated Units */}
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span
                        className={
                          units === 2
                            ? 'text-indigo-600'
                            : units === 1.5
                            ? 'text-indigo-500'
                            : units === 1
                            ? 'text-slate-800'
                            : 'text-slate-300'
                        }
                      >
                        {formatUnits(units)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dedicated Guest Meals Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Guest Meals Tracking</h2>
            <p className="text-xs text-slate-500">
              Guest portions use the same weighting rule and are charged directly to the host member.
            </p>
          </div>
          <button
            onClick={() => setShowGuestForm(!showGuestForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Guest Meal</span>
          </button>
        </div>

        {/* Guest Add Form */}
        {showGuestForm && (
          <form onSubmit={handleAddGuest} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-900">Record New Guest Portion</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Host Member:</label>
                <select
                  value={newGuestHostId}
                  onChange={(e) => setNewGuestHostId(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                >
                  {activeMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Guest Description:</label>
                <input
                  type="text"
                  placeholder="e.g. Cousins, Tanvir's friend"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Lunch Guests {lunchServed ? '(1.5u or 1.0u)' : '(Not served)'}:
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  disabled={!lunchServed}
                  value={newGuestLunch}
                  onChange={(e) => setNewGuestLunch(parseInt(e.target.value) || 0)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-900 disabled:opacity-40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Night Guests {nightServed ? '(1.0u)' : '(Not served)'}:
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  disabled={!nightServed}
                  value={newGuestNight}
                  onChange={(e) => setNewGuestNight(parseInt(e.target.value) || 0)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-900 disabled:opacity-40"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-slate-500">
                Calculated Guest Units:{' '}
                <span className="font-mono font-bold text-indigo-600">
                  {formatUnits(calculateGuestUnits(lunchServed, nightServed, newGuestLunch, newGuestNight))} units
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowGuestForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Add to List
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Existing Guest List for this day */}
        {guestList.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No guest meals recorded for {selectedDate}.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {guestList.map((g, idx) => {
              const host = members.find((m) => m.id === g.hostMemberId);
              const units = calculateGuestUnits(lunchServed, nightServed, g.lunchCount, g.nightCount);

              return (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">
                      {g.guestName || 'Guest Portion'}
                    </span>
                    <span className="text-slate-400 mx-1.5">·</span>
                    <span className="text-slate-600">Host: {host?.name || 'Unknown'}</span>
                    <span className="text-slate-400 mx-1.5">·</span>
                    <span className="text-slate-500">
                      Lunch: {g.lunchCount}, Night: {g.nightCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-indigo-600">
                      +{formatUnits(units)} units
                    </span>
                    <button
                      onClick={() => removeGuest(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                      title="Remove guest"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
