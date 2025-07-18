import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import BlurCircle from "./BlurCircle";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const DateSelect = ({ dateTime, id }) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);

  const onBookHandler = () => {
    if (!selectedDate) return toast("Please Select a Date");
    navigate(`/movies/${id}/${selectedDate}`);
    scrollTo(0, 0);
  };

  return (
    <div id="dateSelect" className="pt-30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle top="100px" right="0px" />
        <div>
          <p className="text-lg font-semibold">Choose Date</p>
          <div className="flex items-center gap-6 text-sm mt-5">
            <ChevronLeftIcon className="w-[28px]" />
            <span className="grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4">
              {Object.keys(dateTime).map((date) => (
                <button
                  key={date}
                  className={`flex flex-col items-center justify-center size-14 aspect-square rounded cursor-pointer hover:text-white hover:bg-primary/20 ${
                    selectedDate === date
                      ? "bg-primary text-white"
                      : "border border-primary/70"
                  }`}
                  onClick={() => {
                    setSelectedDate(date);
                  }}
                >
                  <span>{new Date(date).getDate()}</span>
                  <span>
                    {new Date(date).toLocaleDateString("en-IN", {
                      month: "short",
                    })}
                  </span>
                </button>
              ))}
            </span>
            <ChevronRightIcon className="w-[28px]" />
          </div>
        </div>
        <button
          onClick={onBookHandler}
          className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default DateSelect;
