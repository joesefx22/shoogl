// src/components/common/inputs/SelectField.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, AlertCircle, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectFieldProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** Label للـ select */
  label?: string;
  /** مساعدة أو وصف تحت الـ select */
  helperText?: string;
  /** رسالة خطأ */
  error?: string;
  /** وضع full width */
  fullWidth?: boolean;
  /** خيارات الـ select */
  options: SelectOption[];
  /** أيقونة في البداية */
  startIcon?: React.ReactNode;
  /** حجم الـ select */
  size?: "sm" | "md" | "lg";
  /** حالة الـ select */
  status?: "default" | "success" | "warning" | "error";
  /** مطلوب */
  required?: boolean;
  /** مكان holder */
  placeholder?: string;
  /** بحث في الخيارات */
  searchable?: boolean;
  /** متعدد الاختيار */
  multiple?: boolean;
  /** تحديد كامل */
  selectAll?: boolean;
}

const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      fullWidth = false,
      options,
      startIcon,
      size = "md",
      status = "default",
      required = false,
      placeholder = "اختر من القائمة",
      searchable = false,
      multiple = false,
      selectAll = false,
      disabled = false,
      id,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [localValue, setLocalValue] = React.useState(value);
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    
    const selectRef = React.useRef<HTMLSelectElement>(null);

    // Handle outside click
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter options based on search
    const filteredOptions = searchable
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          option.value.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    // Size styles
    const sizeStyles = {
      sm: "h-8 px-2 text-sm",
      md: "h-10 px-3",
      lg: "h-12 px-4 text-lg",
    };

    // Status styles
    const statusStyles = {
      default: cn(
        "border-gray-300 focus:border-primary-500 focus:ring-primary-500",
        "dark:border-gray-600 dark:focus:border-primary-400 dark:focus:ring-primary-400"
      ),
      success: cn(
        "border-success-500 focus:border-success-500 focus:ring-success-500",
        "dark:border-success-400 dark:focus:border-success-400 dark:focus:ring-success-400"
      ),
      warning: cn(
        "border-warning-500 focus:border-warning-500 focus:ring-warning-500",
        "dark:border-warning-400 dark:focus:border-warning-400 dark:focus:ring-warning-400"
      ),
      error: cn(
        "border-danger-500 focus:border-danger-500 focus:ring-danger-500",
        "dark:border-danger-400 dark:focus:border-danger-400 dark:focus:ring-danger-400"
      ),
    };

    // Base select styles
    const baseSelectStyles = cn(
      "appearance-none w-full rounded-lg border bg-white text-gray-900",
      "focus:outline-none focus:ring-2 focus:ring-offset-1",
      "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500",
      "dark:bg-gray-800 dark:text-white",
      "transition-colors duration-200",
      sizeStyles[size],
      status === "error" ? statusStyles.error : statusStyles[status],
      startIcon && "pl-10",
      "pr-10" // For dropdown icon
    );

    // Container styles
    const containerStyles = cn("space-y-1", fullWidth && "w-full", className);

    // Get selected label(s)
    const getSelectedLabel = () => {
      if (!localValue) return placeholder;
      
      if (multiple && Array.isArray(localValue)) {
        const selectedOptions = options.filter(opt => localValue.includes(opt.value));
        return selectedOptions.length > 0
          ? `${selectedOptions.length} عنصر محدد`
          : placeholder;
      }
      
      const selectedOption = options.find(opt => opt.value === localValue);
      return selectedOption?.label || placeholder;
    };

    // Handle selection change
    const handleSelectChange = (optionValue: string) => {
      let newValue;
      
      if (multiple) {
        const currentValues = Array.isArray(localValue) ? localValue : [];
        newValue = currentValues.includes(optionValue)
          ? currentValues.filter(v => v !== optionValue)
          : [...currentValues, optionValue];
      } else {
        newValue = optionValue;
        setIsOpen(false);
      }
      
      setLocalValue(newValue);
      
      // Trigger onChange
      if (onChange) {
        const event = {
          target: { value: newValue, name: props.name },
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(event);
      }
    };

    // Select all options
    const handleSelectAll = () => {
      const allValues = options.filter(opt => !opt.disabled).map(opt => opt.value);
      setLocalValue(allValues);
      
      if (onChange) {
        const event = {
          target: { value: allValues, name: props.name },
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(event);
      }
    };

    // Clear all selections
    const handleClearAll = () => {
      setLocalValue(multiple ? [] : "");
      
      if (onChange) {
        const event = {
          target: { value: multiple ? [] : "", name: props.name },
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(event);
      }
    };

    return (
      <div className={containerStyles}>
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              "block text-sm font-medium text-gray-700 dark:text-gray-300",
              required && "after:content-['*'] after:ml-1 after:text-danger-500"
            )}
          >
            {label}
          </label>
        )}

        {/* Select Container */}
        <div className="relative" ref={selectRef}>
          {/* Start Icon */}
          {startIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-400">{startIcon}</span>
            </div>
          )}

          {/* Hidden select for form submission */}
          <select
            ref={ref}
            id={selectId}
            className="sr-only"
            value={localValue}
            onChange={onChange}
            disabled={disabled}
            multiple={multiple}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom select trigger */}
          <button
            type="button"
            className={cn(
              baseSelectStyles,
              "flex items-center justify-between text-left",
              "hover:bg-gray-50 dark:hover:bg-gray-700",
              isOpen && "ring-2 ring-primary-500 border-primary-500"
            )}
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className="truncate">{getSelectedLabel()}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-gray-400 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
              {/* Search input */}
              {searchable && (
                <div className="border-b border-gray-100 dark:border-gray-700 p-2">
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="بحث..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              {/* Select All / Clear All */}
              {multiple && selectAll && (
                <div className="flex border-b border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    className="flex-1 px-3 py-2 text-sm text-primary-600 hover:bg-gray-50 dark:text-primary-400 dark:hover:bg-gray-700"
                    onClick={handleSelectAll}
                  >
                    تحديد الكل
                  </button>
                  <button
                    type="button"
                    className="flex-1 px-3 py-2 text-sm text-danger-600 hover:bg-gray-50 dark:text-danger-400 dark:hover:bg-gray-700"
                    onClick={handleClearAll}
                  >
                    إلغاء الكل
                  </button>
                </div>
              )}

              {/* Options list */}
              <div className="max-h-60 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => {
                    const isSelected = multiple
                      ? Array.isArray(localValue) && localValue.includes(option.value)
                      : localValue === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700",
                          isSelected && "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400",
                          option.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent"
                        )}
                        onClick={() => !option.disabled && handleSelectChange(option.value)}
                        disabled={option.disabled}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div className="flex items-center gap-2">
                          {option.icon && <span className="text-gray-400">{option.icon}</span>}
                          <div>
                            <div className="font-medium">{option.label}</div>
                            {option.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {option.description}
                              </div>
                            )}
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                    لا توجد نتائج
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Icon */}
          {(status === "error" || status === "success" || status === "warning") && (
            <div className="absolute inset-y-0 right-10 flex items-center pointer-events-none">
              {status === "error" && (
                <AlertCircle className="h-4 w-4 text-danger-500" aria-hidden="true" />
              )}
              {status === "success" && (
                <Check className="h-4 w-4 text-success-500" aria-hidden="true" />
              )}
              {status === "warning" && (
                <AlertCircle className="h-4 w-4 text-warning-500" aria-hidden="true" />
              )}
            </div>
          )}
        </div>

        {/* Helper Text */}
        {helperText && !error && (
          <p
            id={`${selectId}-helper`}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={`${selectId}-error`}
            className="text-sm text-danger-600 dark:text-danger-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

SelectField.displayName = "SelectField";

// Pre-configured select components
export const StadiumTypeSelect = React.forwardRef<
  HTMLSelectElement,
  Omit<SelectFieldProps, "options" | "placeholder">
>((props, ref) => (
  <SelectField
    ref={ref}
    options={[
      { value: "FOOTBALL", label: "ملعب كرة قدم" },
      { value: "PADDLE", label: "ملعب بادل" },
      { value: "TENNIS", label: "ملعب تنس" },
      { value: "BASKETBALL", label: "ملعب كرة سلة" },
    ]}
    placeholder="اختر نوع الملعب"
    {...props}
  />
));
StadiumTypeSelect.displayName = "StadiumTypeSelect";

export const RoleSelect = React.forwardRef<
  HTMLSelectElement,
  Omit<SelectFieldProps, "options" | "placeholder">
>((props, ref) => (
  <SelectField
    ref={ref}
    options={[
      { value: "PLAYER", label: "لاعب" },
      { value: "STAFF", label: "موظف" },
      { value: "OWNER", label: "مالك" },
      { value: "ADMIN", label: "مدير" },
    ]}
    placeholder="اختر الدور"
    {...props}
  />
));
RoleSelect.displayName = "RoleSelect";

export const CitySelect = React.forwardRef<
  HTMLSelectElement,
  Omit<SelectFieldProps, "options" | "placeholder">
>((props, ref) => (
  <SelectField
    ref={ref}
    options={[
      { value: "cairo", label: "القاهرة" },
      { value: "alexandria", label: "الإسكندرية" },
      { value: "giza", label: "الجيزة" },
      { value: "sharqia", label: "الشرقية" },
      { value: "dakahlia", label: "الدقهلية" },
      { value: "beheira", label: "البحيرة" },
      { value: "monufia", label: "المنوفية" },
      { value: "qalyubia", label: "القليوبية" },
      { value: "sohag", label: "سوهاج" },
      { value: "asyut", label: "أسيوط" },
    ]}
    placeholder="اختر المدينة"
    searchable
    {...props}
  />
));
CitySelect.displayName = "CitySelect";

export const SkillLevelSelect = React.forwardRef<
  HTMLSelectElement,
  Omit<SelectFieldProps, "options" | "placeholder">
>((props, ref) => (
  <SelectField
    ref={ref}
    options={[
      { value: "beginner", label: "مبتدئ" },
      { value: "intermediate", label: "متوسط" },
      { value: "advanced", label: "متقدم" },
      { value: "professional", label: "محترف" },
    ]}
    placeholder="اختر مستوى المهارة"
    {...props}
  />
));
SkillLevelSelect.displayName = "SkillLevelSelect";

export default SelectField;
