import React, {
    useEffect,
    useState,
    useMemo,
} from "react";
import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import Palette from "../Inntekt/Palette";
const PieChartTest = () => {
    const data01 = [
        { name: 'Group A', value: 400 },
        { name: 'Group B', value: 300 },
        { name: 'Group C', value: 300 },
        { name: 'Group D', value: 200 },
        { name: 'Group E', value: 278 },
        { name: 'Group F', value: 189 },
    ];
return (
    <>  
    <Palette/>
            <PieChart width={200} height={200}>
                <Pie
                    dataKey="value"
                    isAnimationActive={false}
                    data={data01}
                    cx="50%"
                    cy="50%"
                    outerRadius={40}
                    fill="#8884d8"
                    label
                />
                <Tooltip />
            </PieChart>
            </>
);
};

export default PieChartTest;