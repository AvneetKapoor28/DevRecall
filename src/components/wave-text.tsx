import React from "react";
import "./wave-text.css"; // You'll create this CSS file

interface WaveTextProps {
  text: string;
  className?: string; // optional extra styling
}

const WaveText: React.FC<WaveTextProps> = ({ text, className = "" }) => {
  return (
    <div className={`wave-container ${className}`}>
      <h1 className="wave-text">
        {text.split("").map((char, index) => (
          <span
            key={index}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default WaveText;
