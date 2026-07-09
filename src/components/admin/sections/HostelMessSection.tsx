import React, { useState, useEffect } from "react";
import { 
  Coffee, 
  Utensils, 
  Moon, 
  Edit2, 
  Calendar, 
  ClipboardCheck, 
  Users, 
  Search,
  TrendingUp
} from "lucide-react";

interface HostelMessSectionProps {
  activeTab: string;
  organizationId: string;
  members: any[];
}

interface MenuItem {
  breakfast: string;
  lunch: string;
  dinner: string;
}

type WeeklyMenu = Record<string, MenuItem>;

export default function HostelMessSection({ activeTab, organizationId, members }: HostelMessSectionProps) {
  // Weekly Menu state
  const [menu, setMenu] = useState<WeeklyMenu>({});
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editBreakfast, setEditBreakfast] = useState("");
  const [editLunch, setEditLunch] = useState("");
  const [editDinner, setEditDinner] = useState("");

  // Mess Log state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMeal, setSelectedMeal] = useState<"Breakfast" | "Lunch" | "Dinner">("Breakfast");
  const [consumptionLogs, setConsumptionLogs] = useState<string[]>([]); // Array of member IDs who dined
  const [memberDiets, setMemberDiets] = useState<Record<string, "Veg" | "Non-Veg" | "Vegan">>({});
  const [searchQuery, setSearchQuery] = useState("");

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Load from local storage scoped by organization
  useEffect(() => {
    if (!organizationId) return;

    // Load Menu
    const storedMenu = localStorage.getItem(`mess_menu_${organizationId}`);
    if (storedMenu) {
      setMenu(JSON.parse(storedMenu));
    } else {
      // Default sample weekly menu
      const defaultMenu: WeeklyMenu = {
        Monday: { breakfast: "Idli, Sambar, Tea", lunch: "Rice, Dal, Mixed Veg, Salad", dinner: "Chapati, Paneer Masala, Curd" },
        Tuesday: { breakfast: "Poha, Jalebi, Sprouts", lunch: "Jeera Rice, Chole, Roti", dinner: "Khichdi, Kadhi, Papad" },
        Wednesday: { breakfast: "Aloo Paratha, Curd, Butter", lunch: "Veg Biryani, Raita, Salad", dinner: "Roti, Mix Veg Fry, Dal Fry" },
        Thursday: { breakfast: "Bread Butter, Omelette/Banana", lunch: "Rice, Sambar, Potato Fry", dinner: "Roti, Egg Curry/Paneer Butter, Curd" },
        Friday: { breakfast: "Puri Bhaji, Tea", lunch: "Roti, Rajma, Steamed Rice", dinner: "Veg Pulao, Dal Makhani, Custard" },
        Saturday: { breakfast: "Sandwiches, Milk/Coffee", lunch: "Lemon Rice, Curd Rice, Papad", dinner: "Chapati, Bhindi Fry, Moong Dal" },
        Sunday: { breakfast: "Chole Bhature, Lassi", lunch: "Special Thali (Pulav, Dal, Roti, Kheer)", dinner: "Pasta/Noodles, Fried Rice, Soup" }
      };
      setMenu(defaultMenu);
      localStorage.setItem(`mess_menu_${organizationId}`, JSON.stringify(defaultMenu));
    }

    // Load Diet Preferences
    const storedDiets = localStorage.getItem(`mess_diets_${organizationId}`);
    if (storedDiets) {
      setMemberDiets(JSON.parse(storedDiets));
    } else {
      // Prepopulate diets for members randomly or default to Veg
      const initialDiets: Record<string, "Veg" | "Non-Veg" | "Vegan"> = {};
      members.forEach((m) => {
        initialDiets[m.id] = (m.id.charCodeAt(0) % 3 === 0) ? "Non-Veg" : (m.id.charCodeAt(0) % 3 === 1) ? "Veg" : "Vegan";
      });
      setMemberDiets(initialDiets);
      localStorage.setItem(`mess_diets_${organizationId}`, JSON.stringify(initialDiets));
    }
  }, [organizationId, members]);

  // Load Consumption Logs when Date or Meal changes
  useEffect(() => {
    if (!organizationId) return;
    const logKey = `mess_log_${organizationId}_${selectedDate}_${selectedMeal}`;
    const storedLog = localStorage.getItem(logKey);
    if (storedLog) {
      setConsumptionLogs(JSON.parse(storedLog));
    } else {
      setConsumptionLogs([]);
    }
  }, [organizationId, selectedDate, selectedMeal]);

  // Save menu helper
  const saveMenu = (updatedMenu: WeeklyMenu) => {
    setMenu(updatedMenu);
    localStorage.setItem(`mess_menu_${organizationId}`, JSON.stringify(updatedMenu));
  };

  // Edit Menu Day trigger
  const handleStartEdit = (day: string) => {
    setEditingDay(day);
    setEditBreakfast(menu[day]?.breakfast || "");
    setEditLunch(menu[day]?.lunch || "");
    setEditDinner(menu[day]?.dinner || "");
  };

  // Save Day Menu
  const handleSaveDayMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDay) return;

    const updated = {
      ...menu,
      [editingDay]: {
        breakfast: editBreakfast,
        lunch: editLunch,
        dinner: editDinner
      }
    };
    saveMenu(updated);
    setEditingDay(null);
  };

  // Diet Preference change
  const handleDietChange = (memberId: string, diet: "Veg" | "Non-Veg" | "Vegan") => {
    const updatedDiets = {
      ...memberDiets,
      [memberId]: diet
    };
    setMemberDiets(updatedDiets);
    localStorage.setItem(`mess_diets_${organizationId}`, JSON.stringify(updatedDiets));
  };

  // Toggle meal attendance
  const handleToggleAttendance = (memberId: string) => {
    let updatedLogs = [...consumptionLogs];
    if (updatedLogs.includes(memberId)) {
      updatedLogs = updatedLogs.filter((id) => id !== memberId);
    } else {
      updatedLogs.push(memberId);
    }
    setConsumptionLogs(updatedLogs);

    const logKey = `mess_log_${organizationId}_${selectedDate}_${selectedMeal}`;
    localStorage.setItem(logKey, JSON.stringify(updatedLogs));
  };

  // Filter members for attendance sheet
  const filteredMembers = members.filter((m) =>
    m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculations
  const totalDieters = Object.keys(memberDiets).length || 1;
  const vegCount = Object.values(memberDiets).filter((d) => d === "Veg").length;
  const nonVegCount = Object.values(memberDiets).filter((d) => d === "Non-Veg").length;
  const veganCount = Object.values(memberDiets).filter((d) => d === "Vegan").length;

  const vegPercent = Math.round((vegCount / totalDieters) * 100);
  const nonVegPercent = Math.round((nonVegCount / totalDieters) * 100);
  const veganPercent = Math.round((veganCount / totalDieters) * 100);

  const totalDinedToday = consumptionLogs.length;
  const messAttendanceRate = members.length > 0 ? Math.round((totalDinedToday / members.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── WEEKLY MENU TAB ── */}
      {activeTab === "menu" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">Weekly Food Menu & Timings</h3>
            <p className="text-slate-500 text-xs font-semibold">Click on edit icon to modify daily recipes</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {daysOfWeek.map((day) => {
              const dayMenu = menu[day] || { breakfast: "—", lunch: "—", dinner: "—" };
              return (
                <div key={day} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h4 className="font-extrabold text-slate-900 text-base">{day}</h4>
                      <button
                        onClick={() => handleStartEdit(day)}
                        className="text-indigo-600 hover:text-indigo-800 p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                        title="Edit Menu"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 text-sm mt-0.5">
                          <Coffee className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Breakfast</p>
                          <p className="text-slate-700 text-xs font-medium leading-relaxed mt-0.5">{dayMenu.breakfast}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0 text-sm mt-0.5">
                          <Utensils className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Lunch</p>
                          <p className="text-slate-700 text-xs font-medium leading-relaxed mt-0.5">{dayMenu.lunch}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 text-sm mt-0.5">
                          <Moon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Dinner</p>
                          <p className="text-slate-700 text-xs font-medium leading-relaxed mt-0.5">{dayMenu.dinner}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* EDIT MENU MODAL */}
          {editingDay && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-scaleUp">
                <button
                  onClick={() => setEditingDay(null)}
                  className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 text-xl font-bold"
                >
                  ✕
                </button>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Edit {editingDay} Menu</h3>
                <p className="text-slate-500 text-sm mb-6">Input standard meal choices and descriptions.</p>

                <form onSubmit={handleSaveDayMenu} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Coffee className="w-3.5 h-3.5 text-orange-500" /> Breakfast Menu
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Eggs, Toast, Coffee"
                      value={editBreakfast}
                      onChange={(e) => setEditBreakfast(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Utensils className="w-3.5 h-3.5 text-green-500" /> Lunch Menu
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Rice, Veg Stew, Bread"
                      value={editLunch}
                      onChange={(e) => setEditLunch(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Moon className="w-3.5 h-3.5 text-indigo-500" /> Dinner Menu
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Chapati, Baked Tofu, Soup"
                      value={editDinner}
                      onChange={(e) => setEditDinner(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-250 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingDay(null)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MESS LOG TAB ── */}
      {activeTab === "meals" && (
        <div className="space-y-6 animate-fadeIn">
          {/* STATS HEADER */}
          <div className="grid sm:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Members</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{members.length}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl font-bold">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Dined Today</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalDinedToday} ({messAttendanceRate}%)</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4 sm:col-span-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Diet Preferences Distribution</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${vegPercent}%` }} title={`Veg: ${vegCount}`} />
                    <div className="bg-orange-500 h-full" style={{ width: `${nonVegPercent}%` }} title={`Non-Veg: ${nonVegCount}`} />
                    <div className="bg-blue-500 h-full" style={{ width: `${veganPercent}%` }} title={`Vegan: ${veganCount}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                    V: {vegCount} | NV: {nonVegCount} | Vg: {veganCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LOG CONSOLE */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* SEARCH AND FILTERS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-1 space-y-5 h-fit">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" /> Filter Log Sheet
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase mb-1.5">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-655 uppercase mb-1.5">Select Meal</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Breakfast", "Lunch", "Dinner"].map((meal) => (
                      <button
                        key={meal}
                        onClick={() => setSelectedMeal(meal as any)}
                        className={`py-2 rounded-xl text-xs font-semibold border transition ${
                          selectedMeal === meal
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {meal}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ATTENDANCE WORK SHEET */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h3 className="font-bold text-slate-800 text-base">
                  Daily Attendance: {selectedMeal} ({selectedDate})
                </h3>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search member..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* LIST SHEET */}
              <div className="border border-slate-150 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {filteredMembers.map((member) => {
                  const hasDined = consumptionLogs.includes(member.id);
                  const dietPref = memberDiets[member.id] || "Veg";

                  return (
                    <div key={member.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={hasDined}
                          onChange={() => handleToggleAttendance(member.id)}
                          className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-850 text-sm truncate">
                            {member.full_name}
                          </p>
                          <p className="text-slate-400 text-[10px] truncate">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* DIET DROPDOWN */}
                        <select
                          value={dietPref}
                          onChange={(e) => handleDietChange(member.id, e.target.value as any)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-full border bg-white focus:outline-none ${
                            dietPref === "Veg"
                              ? "text-green-600 border-green-200"
                              : dietPref === "Non-Veg"
                              ? "text-orange-600 border-orange-200"
                              : "text-blue-600 border-blue-200"
                          }`}
                        >
                          <option value="Veg">Veg</option>
                          <option value="Non-Veg">Non-Veg</option>
                          <option value="Vegan">Vegan</option>
                        </select>

                        <span className={`text-xs font-bold ${hasDined ? "text-green-600" : "text-slate-400"}`}>
                          {hasDined ? "Dined ✅" : "Absent ❌"}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredMembers.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-sm italic">
                    No members matching your search query.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
