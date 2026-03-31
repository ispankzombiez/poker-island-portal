/**
 * Portal UI Components
 * Custom UI components for the Nightshade Arcade portal
 * Matches the game's CloseablePanel format exactly
 */

import React, { type JSX } from "react";
import { Panel } from "components/ui/Panel";
import { Tab } from "components/ui/Tab";
import { SquareIcon } from "components/ui/SquareIcon";
import { PIXEL_SCALE } from "../constants";
import { SUNNYSIDE } from "assets/sunnyside";
import classNames from "classnames";
import { useSound } from "lib/utils/hooks/useSound";

export interface PortalPanelTabs<T extends string> {
  icon: string;
  name: string;
  id: T;
}

interface PortalPanelProps<T extends string> {
  tabs?: PortalPanelTabs<T>[];
  currentTab?: T;
  setCurrentTab?: React.Dispatch<React.SetStateAction<T>>;
  title?: string | JSX.Element;
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Portal version of CloseButtonPanel
 * Matches game format with tabs, text labels, and proper icons
 */
export const PortalCloseButtonPanel = <T extends string>({
  tabs,
  currentTab,
  setCurrentTab,
  title,
  onClose,
  className,
  children,
}: PortalPanelProps<T>) => {
  const tabSound = useSound("tab");
  const button = useSound("button");

  const activeTab = currentTab ?? tabs?.[0]?.id;

  const handleTabClick = (index: T) => {
    tabSound.play();
    setCurrentTab && setCurrentTab(index);
  };

  const showCloseButton = !!onClose;

  return (
    <Panel
      className={classNames(
        "relative max-h-[90vh] overflow-y-auto overflow-x-hidden scrollable",
        className,
      )}
      hasTabs={!!tabs}
    >
      {/* Tabs */}
      {tabs && (
        <div
          className="absolute flex"
          style={{
            top: `${PIXEL_SCALE * 1}px`,
            left: `0px`,
            right: `${PIXEL_SCALE * 1}px`,
          }}
        >
          <div className="flex overflow-x-auto scrollbar-hide mr-auto">
            {tabs.map((tab, index) => (
              <Tab
                key={`tab-${index}`}
                isFirstTab={index === 0}
                className="relative mr-1"
                isActive={tab.id === activeTab}
                onClick={() => {
                  tabSound.play();
                  handleTabClick(tab.id);
                }}
              >
                <SquareIcon icon={tab.icon} width={7} />
                <span
                  className="text-xs sm:text-sm text-ellipsis ml-1 whitespace-nowrap"
                >
                  {tab.name}
                </span>
              </Tab>
            ))}
          </div>

          {showCloseButton && (
            <img
              src={SUNNYSIDE.icons.close}
              className="flex-none cursor-pointer float-right"
              onClick={() => {
                button.play();
                onClose();
              }}
              style={{
                width: `${PIXEL_SCALE * 11}px`,
                height: `${PIXEL_SCALE * 11}px`,
                marginTop: `${PIXEL_SCALE * 1}px`,
                marginLeft: `${PIXEL_SCALE * 2}px`,
                marginRight: `${PIXEL_SCALE * 1}px`,
              }}
            />
          )}
        </div>
      )}

      {/* Content */}
      <div>
        {title && (
          <div className="flex text-center">
            {showCloseButton && !tabs && (
              <div
                className="flex-none"
                style={{
                  width: `${PIXEL_SCALE * 11}px`,
                }}
              />
            )}
            <div className="grow mb-3 text-lg">{title}</div>
            {showCloseButton && !tabs && (
              <div className="flex-none">
                <img
                  src={SUNNYSIDE.icons.close}
                  className="cursor-pointer"
                  onClick={onClose}
                  style={{
                    width: `${PIXEL_SCALE * 11}px`,
                  }}
                />
              </div>
            )}
          </div>
        )}
        {showCloseButton && !tabs && !title && (
          <img
            src={SUNNYSIDE.icons.close}
            className="absolute cursor-pointer z-20 top-3 right-3"
            onClick={onClose}
            style={{
              width: `${PIXEL_SCALE * 11}px`,
            }}
          />
        )}
        {children}
      </div>
    </Panel>
  );
};
