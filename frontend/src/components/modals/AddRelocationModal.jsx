import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { X } from "lucide-react";
import { useUIStore } from "../../store/useUIStore";
import { useCreateRelocation, useCities, useOpsUsers } from "../../hooks/useRelocations";
import FormField from "../ui/FormField";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddRelocationModal() {
  const isOpen = useUIStore((s) => s.isAddModalOpen);
  const close = useUIStore((s) => s.closeAddModal);
  const { data: cities } = useCities();
  const { data: opsUsers } = useOpsUsers();
  const createRelocation = useCreateRelocation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { customerName: "", customerPhone: "", originCity: "", destCity: "", moveDate: "", opsOwner: "" },
  });

  useEffect(() => {
    if (isOpen && cities?.length && opsUsers?.length) {
      reset({ customerName: "", customerPhone: "", originCity: cities[0], destCity: cities[1] ?? cities[0], moveDate: "", opsOwner: opsUsers[0] });
    }
  }, [isOpen, cities, opsUsers, reset]);

  const originCity = watch("originCity");

  const onSubmit = async (values) => {
    try {
      const created = await createRelocation.mutateAsync(values);
      close();
      navigate(`/relocations/${created.id}`);
    } catch (err) {
      setError("root", { message: err.message });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-ink/45"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-md rounded-2xl p-6 bg-surface shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-semibold text-lg text-ink">New relocation</h2>
              <button onClick={close} aria-label="Close">
                <X size={18} className="text-ink-soft" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
              <FormField label="Customer name" error={errors.customerName?.message}>
                <input
                  {...register("customerName", {
                    required: "Add a customer name to continue.",
                    maxLength: { value: 120, message: "Keep it under 120 characters." },
                  })}
                  placeholder="e.g. Rahul Menon"
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-border-strong"
                />
              </FormField>

              <FormField label="Phone (optional)" error={errors.customerPhone?.message}>
                <input
                  {...register("customerPhone", { maxLength: { value: 30, message: "That's too long for a phone number." } })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-border-strong"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="From" error={errors.originCity?.message}>
                  <select
                    {...register("originCity", { required: true })}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-border-strong"
                  >
                    {cities?.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="To" error={errors.destCity?.message}>
                  <select
                    {...register("destCity", {
                      required: true,
                      validate: (v) => v !== originCity || "Origin and destination can't be the same city.",
                    })}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-border-strong"
                  >
                    {cities?.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Move date" error={errors.moveDate?.message}>
                  <input
                    type="date"
                    min={todayIso()}
                    {...register("moveDate", { required: "Pick a move date to continue." })}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-border-strong"
                  />
                </FormField>
                <FormField label="Ops owner" error={errors.opsOwner?.message}>
                  <select
                    {...register("opsOwner", { required: true })}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-border-strong"
                  >
                    {opsUsers?.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              {errors.root && <p className="text-xs text-rust">{errors.root.message}</p>}

              <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
                {isSubmitting ? "Starting…" : "Start tracking"}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
