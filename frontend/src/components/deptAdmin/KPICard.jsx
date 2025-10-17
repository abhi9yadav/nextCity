import { formatNumber } from "../../utils/formatting";

const colorMap = {
  blue: {
    bg: "bg-gradient-to-br from-blue-600 to-blue-800",
    shadow: "shadow-blue-500/50",
    accent: "text-blue-200",
  },
  orange: {
    bg: "bg-gradient-to-br from-orange-500 to-red-600",
    shadow: "shadow-orange-500/50",
    accent: "text-orange-200",
  },
  green: {
    bg: "bg-gradient-to-br from-green-500 to-emerald-600",
    shadow: "shadow-green-500/50",
    accent: "text-green-200",
  },
  yellow: {
    bg: "bg-gradient-to-br from-yellow-500 to-amber-600",
    shadow: "shadow-yellow-500/50",
    accent: "text-yellow-200",
  },
};

export const KPICard = ({ title, value, subtitle, icon, color, rating }) => {
  const isRatingCard = rating !== undefined;
  const colors = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`p-6 rounded-xl transition-all duration-500 cursor-pointer 
                  ${colors.bg} 
                  shadow-xl ${colors.shadow} 
                  hover:scale-[1.03] hover:shadow-2xl 
                  text-white`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-white/90">
            {title}
          </p>
          {isRatingCard ? (
            <div className="text-6xl font-extrabold mt-2 leading-none">
              {value}
            </div>
          ) : (
            <div className="text-6xl font-extrabold mt-2 leading-none">
              {formatNumber(value)}
            </div>
          )}
        </div>

        {icon && (
          <i className={`${icon} text-4xl opacity-50 ${colors.accent}`}></i>
        )}
      </div>

      <div className="mt-5 pt-4 border-t-2 border-white border-opacity-30">
        {isRatingCard ? (
          <>
            <div className="text-sm font-medium">Based on 120 reviews</div>
            <div className="mt-1 flex items-center text-yellow-300 text-3xl drop-shadow-md">
              {"★".repeat(Math.floor(value))}
              {"☆".repeat(5 - Math.floor(value))}
            </div>
          </>
        ) : (
          <p className="text-sm font-medium text-white/90">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export const kpiData = [
  {
    title: "Total Complaints",
    value: 1245,
    subtitle: "Updated till today",
    icon: "fas fa-ticket-alt",
    color: "blue",
  },
  {
    title: "Complaints in Progress",
    value: 350,
    subtitle: "Need urgent attention",
    icon: "fas fa-clock",
    color: "orange",
  },
  {
    title: "Total Workers",
    value: 89,
    subtitle: "Managing all zones",
    icon: "fas fa-hard-hat",
    color: "green",
  },
  {
    title: "Average Worker Rating",
    value: 4.7,
    subtitle: "Next review due next wk",
    icon: "fas fa-star",
    color: "yellow",
    rating: true,
  },
];
