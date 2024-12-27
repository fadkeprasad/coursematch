//import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Define the ReportHandler type manually
type ReportHandler = (metric: {
  name: string;
  value: number;
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
 //   getCLS(onPerfEntry);
   // getFID(onPerfEntry);
    //getFCP(onPerfEntry);
    //getLCP(onPerfEntry);
    //getTTFB(onPerfEntry);
  }
};

export default reportWebVitals;
