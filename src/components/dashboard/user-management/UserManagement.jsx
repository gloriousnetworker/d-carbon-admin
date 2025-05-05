"use client";

import React, { useState } from 'react';
import { FiChevronDown, FiX } from 'react-icons/fi';

const DashboardHelpCentre = () => {
  // Inline style constants based on your styles.js
  const mainContainer =
    'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white';
  const cardContainer = 'bg-white p-4 rounded shadow w-full';
  const headingContainer = 'relative w-full flex flex-col items-center mb-2';
  const pageTitle =
    'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center';
  const questionText =
    'font-medium text-gray-800 font-sfpro cursor-pointer';
  const answerText = 'text-gray-600 font-sfpro';
  const hrStyle = 'my-3';
  
  // Mock FAQ data (8 items)
  const faqs = [
    {
      id: 1,
      question: "Lorem Ipsum",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
    },
    {
      id: 2,
      question: "Lorem Ipsum",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
    },
    {
      id: 3,
      question: "Lorem Ipsum",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
    },
    {
      id: 4,
      question: "Lorem Ipsum",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
    },
    {
      id: 5,
      question: "Lorem Ipsum",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
    },
    {
      id: 6,
      question: "Lorem Ipsum",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
    },
    {
      id: 7,
      question: "Lorem Ipsum",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
    },
    {
      id: 8,
      question: "Lorem Ipsum",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
    }
  ];

  // State to track which FAQ item is open
  const [openIndex, setOpenIndex] = useState(null);

  // Toggle open/close function
  const handleToggle = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <div className={mainContainer}>
      <div className={cardContainer}>
        <div className={headingContainer}>
          <h2 className={pageTitle}>
            Frequently Asked Questions
          </h2>
        </div>
        <div className="mt-4 w-full">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.id} className="py-2">
                {/* Question row */}
                <div
                  onClick={() => handleToggle(index)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <p className={questionText}>
                    {faq.question}
                  </p>
                  {isOpen ? (
                    <FiX className="text-[#039994]" size={20} />
                  ) : (
                    <FiChevronDown className="text-[#039994]" size={20} />
                  )}
                </div>
                {/* Answer (only rendered if open) */}
                {isOpen && (
                  <div className="mt-2">
                    <p className={answerText}>
                      {faq.answer}
                    </p>
                    <hr className={hrStyle} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardHelpCentre;
