import { CellComponent } from "./CellComponent";
import "./Board.css";

import {
  DestinyConfig,
  DestinyBoard,
  CalendarType,
  defaultCalendar,
} from "fortel-ziweidoushu";
import { useMemo } from "react";
import { RuntimeConfigDataStateType } from "../view/buildBoard/stateMapper";

const configTypeDisplayNameMapping: Record<string, string> = {
  GROUND: "地盤",
  SKY: "天盤",
  HUMAN: "人盤",
};

function Board({
  destinyConfig,
  runtimeConfigDataState,
}: {
  destinyConfig: DestinyConfig;
  runtimeConfigDataState: RuntimeConfigDataStateType;
}) {
  const destinyBoard = useMemo(() => {
    return new DestinyBoard(destinyConfig);
  }, [destinyConfig]);

  const runtimeContext = useMemo(() => {
    if (!destinyConfig || !destinyBoard) {
      return null;
    }

    try {
      let lunarYear, lunarMonth, lunarDay, leap;

      if (
        runtimeConfigDataState.calendarType === CalendarType.SOLAR &&
        runtimeConfigDataState.solarYear &&
        runtimeConfigDataState.solarMonth &&
        runtimeConfigDataState.solarDay
      ) {
        ({
          lunarYear,
          lunarMonth,
          lunarDay,
          isLeapMonth: leap,
        } = defaultCalendar.solar2lunar(
          runtimeConfigDataState.solarYear,
          runtimeConfigDataState.solarMonth,
          runtimeConfigDataState.solarDay
        ));
      } else {
        ({ lunarYear, lunarMonth, lunarDay, leap } = runtimeConfigDataState);
      }

      if (!lunarYear || !lunarMonth || !lunarDay || leap === undefined) {
        return null;
      }

      const runtimeContext = destinyBoard.getRuntimContext({
        lunarYear,
        lunarMonth,
        lunarDay,
        leap,
      });

      console.log(
        "runtimeContext",
        runtimeContext,
        destinyBoard.startControl
          .shift(runtimeContext.yearGround.index)
          .shift(lunarMonth - 1)
      );

      return runtimeContext;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [destinyBoard, destinyConfig, runtimeConfigDataState]);

  const configTextElem = useMemo(
    () => (
      <div className="config-text inline-block">
        {`${destinyConfig.year}(${destinyConfig.yearSky}${
          destinyConfig.yearGround
        })年
            ${destinyConfig.isLeapMonth ? "潤" : ""}
            ${destinyConfig.month}月${destinyConfig.day}日
            ${destinyConfig.bornTimeGround.displayName}
            ${configTypeDisplayNameMapping[destinyConfig.configType]} 
            ${destinyBoard.shadowLight}${
          destinyConfig.gender === "M" ? "男" : "女"
        }`}
      </div>
    ),
    [
      destinyBoard.shadowLight,
      destinyConfig.bornTimeGround.displayName,
      destinyConfig.configType,
      destinyConfig.day,
      destinyConfig.gender,
      destinyConfig.isLeapMonth,
      destinyConfig.month,
      destinyConfig.year,
      destinyConfig.yearGround,
      destinyConfig.yearSky,
    ]
  );

  const cellElements = useMemo(() => {
    return destinyBoard.cells.map((cell: any) => {
      return (
        <CellComponent
          key={cell.cellIndex}
          cellModel={cell}
          destinyBoardModel={destinyBoard}
          runtimeContext={runtimeContext}
          runtimeScope={runtimeConfigDataState.scope ?? 0}
        />
      );
    });
  }, [destinyBoard, runtimeConfigDataState.scope, runtimeContext]);

  return (
    <div className="board">
      <div className="top-row">
        {cellElements[5]}
        {cellElements[6]}
        {cellElements[7]}
        {cellElements[8]}
      </div>
      <div className="middle-row">
        <div className="left-col">
          {cellElements[4]}
          {cellElements[3]}
        </div>
        <div className="middle-area">
          <div>
            {configTextElem}
            <div className="config-text inline-block">
              {destinyBoard.element.displayName}
            </div>
          </div>
          <div>
            <div className="config-text inline-block">
              命主{destinyBoard.destinyMaster.displayName}
            </div>
            <div className="config-text inline-block">
              身主{destinyBoard.bodyMaster.displayName}
            </div>
          </div>
        </div>
        <div className="right-col">
          {cellElements[9]}
          {cellElements[10]}
        </div>
      </div>
      <div className="bottom-row">
        {cellElements[2]}
        {cellElements[1]}
        {cellElements[0]}
        {cellElements[11]}
      </div>
    </div>
  );
}

export { Board };
