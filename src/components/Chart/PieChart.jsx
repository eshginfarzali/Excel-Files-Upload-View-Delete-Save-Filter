/*eslint-disable*/
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';


ChartJS.register(ArcElement, Tooltip, Legend);

 export const PieChart = ({ data }) => {
    
  return (
    <div style={{width:"400px", height:"300px"}}>
      <Pie data={data} ptions={{ responsive: true }}  />
    </div>
  );
};


