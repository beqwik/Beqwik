import { useEffect, useState } from "react";
import { getCurrentMember, getCurrentOrganization } from "../../services/member/memberAuth";
import {
  getAcademyClasses,
  getClassRegistrations,
  unenrollStudentFromClass,
  type AcademyClass
} from "../../services/organization/academyService";
import { BookOpen, Users, Clock, Calendar, CheckCircle2, Search, Sparkles } from "lucide-react";
import { supabase } from "../../services/supabase";

export default function ExploreCourses() {
  const member = getCurrentMember();
  const org = getCurrentOrganization();

  const [classes, setClasses] = useState<AcademyClass[]>([]);
  const [registrations, setRegistrations] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const studentId = member?.student_code || member?.id || member?.email || "";
  const orgId = org?.id || member?.organization_id || "";

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [fetchedClasses, fetchedRegs] = await Promise.all([
          getAcademyClasses(orgId),
          getClassRegistrations(orgId)
        ]);
        setClasses(fetchedClasses);
        setRegistrations(fetchedRegs);
      } catch (err) {
        console.error("Error loading courses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [orgId]);
   
  // =====================================================
  // Load Razorpay Checkout SDK
  // =====================================================
  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      // Already loaded
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      // Prevent duplicate script
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () => resolve(false));
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => {
        resolve(Boolean((window as any).Razorpay));
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  const handleEnrollToggle = async (classId: string) => {
    if (!studentId) return;

    const classRegs = registrations[classId] || [];
    const isEnrolled =
      classRegs.includes(studentId) ||
      Boolean(member?.id && classRegs.includes(member.id)) ||
      Boolean(member?.student_code && classRegs.includes(member.student_code)) ||
      Boolean(member?.email && classRegs.includes(member.email));

    try {
      setProcessingId(classId);
      if (isEnrolled) {
        await unenrollStudentFromClass(classId, studentId, orgId);
        if (member?.id && member.id !== studentId) {
          await unenrollStudentFromClass(classId, member.id, orgId);
        }
        if (member?.email && member.email !== studentId) {
          await unenrollStudentFromClass(classId, member.email, orgId);
        }
        setRegistrations((prev) => ({
          ...prev,
          [classId]: (prev[classId] || []).filter(
            (id) => id !== studentId && id !== member?.id && id !== member?.email
          )
        }));
      } else {

    const cls = classes.find(c => c.id === classId);

    if (!cls) return;

    if (classRegs.length >= cls.maxCapacity) {
        alert("This course is already full.");
        return;
    }

    const confirmPurchase = window.confirm(
        `Enroll in "${cls.className}" for ₹${cls.price} ?`
    );

    if (!confirmPurchase) return;

    const { data, error } = await supabase.functions.invoke(
  "student_purchase_course",
  {
    body: {
      courseId: cls.id,
      studentId,
      organizationId: orgId,
    },
  }
);

if (error) throw error;

console.log("Enrollment:", data);

const {
  data: orderData,
  error: orderError,
} = await supabase.functions.invoke(
  "student_create_course_payment_order",
  {
    body: {
      enrollmentId: data.enrollmentId,
    },
  }
);

if (orderError) throw orderError;

if (!orderData?.success) {
  throw new Error(orderData?.error || "Unable to create payment order.");
}

const razorpayLoaded = await loadRazorpay();

if (!razorpayLoaded) {
  alert("Unable to load Razorpay SDK.");
  return;
}

const options = {
  key: orderData.keyId,

  amount: orderData.amount,

  currency: orderData.currency,

  order_id: orderData.orderId,

  name: org?.name,

  description: cls.className,

  modal: {
  ondismiss: () => {
    console.log("Payment cancelled");
  },
},

  prefill: {
    name: member?.full_name,

    email: member?.email,

    contact: member?.phone,
  },

  handler: async (response: any) => {
  try {
    const { data: verifyData, error: verifyError } =
      await supabase.functions.invoke(
        "student_verify_course_payment",
        {
          body: {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          },
        }
      );

    if (verifyError) throw verifyError;

    if (!verifyData?.success) {
  throw new Error(
    verifyData?.error || "Payment verification failed."
  );
}

    alert("Course purchased successfully.");

    window.location.reload();

  } catch (err) {
    console.error(err);

    alert("Payment verification failed.");
  }
},
};

const razorpay = new (window as any).Razorpay(
  options
);

razorpay.on("payment.failed", (response: any) => {
  console.error(response.error);

  alert(
    "Payment Failed\n\n" +
    response.error.description
  );
});

razorpay.open();

    // Razorpay integration comes next
}
    } catch (err) {
      console.error(err);
      alert("Failed to update enrollment. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredClasses = classes.filter(
    cls =>
      cls.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.room || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
            Explore Courses <Sparkles className="w-6 h-6 text-indigo-600 fill-indigo-100" />
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Browse and enroll in active courses offered by <span className="font-bold text-slate-700">{org?.name || "your academy"}</span>.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses or teachers..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-[14px] text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition shadow-2xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-xs font-bold">Loading available courses...</p>
          </div>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white rounded-[24px] border-2 border-dashed border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-base">No Courses Available</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            There are no active courses published by the academy administration at this moment. Please check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => {
            const classRegs = registrations[cls.id] || [];
            const isEnrolled =
              classRegs.includes(studentId) ||
              Boolean(member?.id && classRegs.includes(member.id)) ||
              Boolean(member?.student_code && classRegs.includes(member.student_code)) ||
              Boolean(member?.email && classRegs.includes(member.email));
            const enrolledCount = classRegs.length;
            const vacancy = cls.maxCapacity - enrolledCount;
            const isFull = vacancy <= 0;

            return (
              <div
                key={cls.id}
                className={`bg-white rounded-[22px] border p-6 flex flex-col justify-between gap-5 transition duration-200 hover:shadow-md ${
                  isEnrolled
                    ? "border-indigo-200 ring-2 ring-indigo-500/10 bg-indigo-50/20"
                    : "border-slate-150 hover:border-indigo-200"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                      Duration: {cls.courseDuration || "6 Months"}
                    </span>
                    {isEnrolled ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                      </span>
                    ) : isFull ? (
                      <span className="text-[9px] font-black uppercase px-2.5 py-0.5 bg-rose-500 text-white rounded-full">
                        Class Full
                      </span>
                    ) : null}
                  </div>

                  <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                    {cls.className}
                  </h3>
                  <p className="text-xs font-bold text-indigo-600">
                    Instructor: <span className="text-slate-800">{cls.instructorName}</span>
                  </p>

                  <div className="space-y-1.5 pt-2 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Timing: {cls.timing || "09:00 - 10:30 AM"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{cls.startDate || "2026-08-01"} to {cls.endDate || "2027-02-01"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  {/* Capacity Bar */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-500 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" /> Seats ({enrolledCount}/{cls.maxCapacity})
                      </span>
                      <span className={vacancy <= 0 ? "text-rose-600" : "text-emerald-600"}>
                        {vacancy <= 0 ? "0 seats left" : `${vacancy} seats left`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${isFull ? "bg-rose-500" : "bg-indigo-600"}`}
                        style={{ width: `${Math.min(100, Math.round((enrolledCount / cls.maxCapacity) * 100))}%` }}
                      />
                    </div>
                  </div>
                     
                    
                  {/* Enroll / Unenroll Button */}
                  <button
                    onClick={() => handleEnrollToggle(cls.id)}
                    disabled={processingId === cls.id || (!isEnrolled && isFull)}
                    className={`w-full py-2.5 rounded-[14px] text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
                      isEnrolled
                        ? "bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200"
                        : isFull
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                        : "bg-blue-600 hover:opacity-95 text-white shadow-md shadow-blue-500/20"
                    }`}
                  >
                    {processingId === cls.id ? (
                      "Updating..."
                    ) : isEnrolled ? (
                      "Unenroll from Course"
                    ) : isFull ? (
                      "Class Full"
                    ) : (
                      "Enroll in Course →"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
