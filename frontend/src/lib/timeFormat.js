const timeFormat = (timeInMinutes) => {
  let hour = Math.floor(timeInMinutes / 60);
  let minute = timeInMinutes % 60;

  return `${hour}h ${minute}m`;
};

export default timeFormat;
