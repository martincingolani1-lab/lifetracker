import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
interface ValidationMessageProps {
  message: string;
  type: "error" | "success" | "info";
}
export const ValidationMessage: React.FC<ValidationMessageProps> = ({
  message,
  type,
}) => {
  const styles = {
    error: "bg-red-500/10 border-red-500/30 text-red-400",
    success: "bg-green-500/10 border-green-500/30 text-green-400",
    info: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  };
  const icons = {
    error: <AlertCircle size={16} />,
    success: <CheckCircle size={16} />,
    info: <AlertCircle size={16} />,
  };
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm animate-in slide-in-from-top-2 duration-300 ${styles[type]}`}
    >
      {" "}
      {icons[type]} <span>{message}</span>{" "}
    </div>
  );
};
interface FormFieldProps {
  label: string;
  error?: string;
  success?: string;
  children: React.ReactNode;
  required?: boolean;
}
export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  success,
  children,
  required,
}) => {
  return (
    <div className="space-y-2">
      {" "}
      <label className="block text-gray-400 text-sm font-bold uppercase tracking-wider">
        {" "}
        {label} {required && <span className="text-red-400 ml-1">*</span>}{" "}
      </label>{" "}
      {children} {error && <ValidationMessage message={error} type="error" />}{" "}
      {success && <ValidationMessage message={success} type="success" />}{" "}
    </div>
  );
};
export default ValidationMessage;
