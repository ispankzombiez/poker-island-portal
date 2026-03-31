/**
 * Portal-specific modal - replaces SpeakingModal from game
 */

import React from "react";
import classNames from "classnames";

interface ModalAction {
  text: string;
  cb: () => void;
}

interface MessageBlock {
  text: string;
  actions?: ModalAction[];
}

interface PortalModalProps {
  onClose: () => void;
  message: MessageBlock[];
  title?: string;
}

export const PortalModal: React.FC<PortalModalProps> = ({ 
  onClose, 
  message, 
  title 
}) => {
  const firstMessage = message[0];

  return (
    <div className="bg-white rounded-lg border-4 border-gray-400 p-5 max-w-sm w-96 shadow-lg">
      {title && (
        <h3 className="font-bold text-lg mb-3 text-gray-900">
          {title}
        </h3>
      )}
      
      {/* Message Text */}
      <p className="text-sm text-gray-800 mb-4 leading-relaxed">
        {firstMessage.text}
      </p>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {firstMessage.actions && firstMessage.actions.length > 0 ? (
          <>
            {firstMessage.actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.cb}
                className="flex-1 px-3 py-2 rounded font-bold text-sm bg-green-600 text-white cursor-pointer hover:bg-green-700 active:bg-green-800 transition-all"
              >
                {action.text}
              </button>
            ))}
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 rounded font-bold text-sm bg-gray-500 text-white cursor-pointer hover:bg-gray-600 active:bg-gray-700 transition-all"
            >
              Close
            </button>
          </>
        ) : (
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded font-bold text-sm bg-blue-600 text-white cursor-pointer hover:bg-blue-700 active:bg-blue-800 transition-all"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};
