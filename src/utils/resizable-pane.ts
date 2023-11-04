import {IContextDetails, IMovingLogicParams, IResizableEvent} from '../@types'
import {MINUS, MINUS_ONE, PLUS} from '../constant'
import {PaneModel} from '../models/pane-model'
import {getList, localConsole, setPaneList} from './development-util'
import {
  change1PixelToPanes, getMaxSizeSum, getMinSizeSum,
  getPanesSizeSum, getResizerSum, getSum, setUISizesOfAllElement, synPanesMaxToSize, synPanesMinToSize
} from './panes'

export const goingDownLogic = (e: IResizableEvent, {axisCoordinate, panesList, activeIndex}: IMovingLogicParams) => {
  let sizeChange = e.mouseCoordinate - <number>axisCoordinate
  if (sizeChange < 0) {
    // throw new Error('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
  }

  let sizeChangeUp = sizeChange

  for (let i = activeIndex; i > MINUS_ONE; i -= 1) {
    sizeChangeUp = panesList[i].changeSize(sizeChangeUp, PLUS)
  }

  sizeChange -= sizeChangeUp

  for (let i = activeIndex + 1; i < panesList.length; i += 1) {
    sizeChange = panesList[i].changeSize(sizeChange, MINUS)
  }
}

export const goingUpLogic = (e: any, {axisCoordinate, panesList, activeIndex}: IMovingLogicParams) => {
  let sizeChange = axisCoordinate - e.mouseCoordinate
  if (sizeChange < 0) {
    // throw new Error('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
  }
  let sizeChangeUp = sizeChange

  for (let i = activeIndex + 1; i < panesList.length; i++) {
    sizeChangeUp = panesList[i].changeSize(sizeChangeUp, PLUS)
  }

  sizeChange -= sizeChangeUp

  for (let i = activeIndex; i > MINUS_ONE; i -= 1) {
    sizeChange = panesList[i].changeSize(sizeChange, MINUS)
  }
}

export const setCurrentMinMax = (serviceRefCurrent: IContextDetails, index?: number) => {
  const {panesList, activeIndex} = serviceRefCurrent
  const {maxPaneSize} = getMaxContainerSizes(serviceRefCurrent)
  const idx = <number>(index || activeIndex)
  const nextIdx = idx + 1
  const aMaxChangeUp = panesList[idx].getMinDiff()
  const bMaxChangeUp = panesList[nextIdx].getMaxDiff()

  setPaneList(panesList, ['minSize', 'maxSize'], null)

  minMaxLogicUp(panesList, aMaxChangeUp - bMaxChangeUp, idx, nextIdx, 0, maxPaneSize)

  localConsole(getList(panesList, 'minSize'), 'minSize')
  localConsole(getList(panesList, 'maxSize'), 'maxSize')
  // setPaneList(panesList, ['minSize', 'maxSize'], null)
  const aMaxChangeDown = panesList[nextIdx].getMinDiff()
  const bMaxChangeDown = panesList[idx].getMaxDiff()
  minMaxLogicDown(panesList, bMaxChangeDown - aMaxChangeDown, idx, nextIdx, 0, maxPaneSize)
  // paneConsole(panesList, 'minSize')
  // paneConsole(panesList, 'maxSize')
  // console.log('minSize ', getList(panesList, 'minSize'))
  // console.log('maxSize ', getList(panesList, 'maxSize'))
}

export const calculateAxes = (serviceRefCurrent: any) => {
  const {panesList, resizersList, activeIndex} = serviceRefCurrent

  const {maxTopAxis} = getMaxContainerSizes(serviceRefCurrent)
  const idx = activeIndex

  const resizerSizeHalf = Math.floor(resizersList[idx].getSize() / 2)
  const resizerAddon = getResizerSum(resizersList, 0, idx - 1) + resizerSizeHalf

  const bottomAxis = maxTopAxis + getMaxSizeSum(panesList, 0, idx) + resizerAddon
  const topAxis = maxTopAxis + getMinSizeSum(panesList, 0, idx) + resizerAddon
  // localConsole({
  //   resizerAddon,
  //   bottomAxis,
  //   topAxis
  // }, 'calculateAxes')
  return {
    bottomAxis,
    topAxis
  }
}

// eslint-disable-next-line complexity
export const minMaxLogicUp = (
  panesList: PaneModel[], value: number, aIndex: number, bIndex: number, sum = 0, maxPaneSize: number) => {
  // Failing for going up Reached Max
  const lastIndex = panesList.length - 1

  // keyConsole({aIndex, bIndex, value, sum}, 'newMinMaxLogicUpnewMinMaxLogicUp')
  let nextValue: number | undefined
  let nextAIndex = aIndex
  let nextBIndex = bIndex

  const paneA = panesList[aIndex]
  const paneB = panesList[bIndex]

  switch (true) {
    // total 6 combination
    case aIndex > 0 && bIndex < lastIndex:
      switch (true) {
        case value < 0:
          sum += paneA.resetMin()
          nextAIndex = aIndex - 1
          nextValue = panesList[nextAIndex].getMinDiff() + value
          break

        case value === 0:
          sum += paneA.resetMin()
          sum += paneB.resetMax()
          nextAIndex = aIndex - 1
          nextBIndex = bIndex + 1
          nextValue = panesList[nextAIndex].getMinDiff() - panesList[nextBIndex].getMaxDiff()
          break

        case value > 0:
          sum += paneB.resetMax()
          nextBIndex = bIndex + 1
          nextValue = value - panesList[nextBIndex].getMaxDiff()
          break
      }
      break
      // ---------------------------------------------------------------------------------
    case aIndex === 0 && bIndex < lastIndex:
      switch (true) {
        case value < 0:
          sum += paneA.resetMin()
          sum += synPanesMaxToSize(panesList, bIndex + 1, lastIndex)
          paneB.maxSize = maxPaneSize - sum
          return

        case value === 0:
          sum += paneA.resetMin()
          sum += paneB.resetMax()
          sum += synPanesMaxToSize(panesList, bIndex + 1, lastIndex)
          return

        case value > 0:
          // not change from previous switch
          sum += paneB.resetMax()
          nextBIndex = bIndex + 1
          nextValue = value - panesList[nextBIndex].getMaxDiff()
          break
      }
      break
      // ---------------------------------------------------------------------------------
    case aIndex > 0 && bIndex === lastIndex:
      switch (true) {
        case value < 0:
          sum += paneA.resetMin()
          nextAIndex = aIndex - 1
          nextValue = panesList[nextAIndex].getMinDiff() + value
          break

        case value === 0:
          sum += paneA.resetMin()
          sum += paneB.resetMax()
          sum += synPanesMinToSize(panesList, 0, aIndex - 1)
          return

        case value > 0:
          sum += paneB.resetMax()
          sum += synPanesMinToSize(panesList, 0, aIndex - 1)
          paneA.minSize = maxPaneSize - sum
          return
      }
      break
      // ---------------------------------------------------------------------------------
      // @ts-ignore
    case aIndex === 0 && bIndex === lastIndex:
      // return for every case
      switch (true) {
        case value < 0:
          sum += paneA.resetMin()
          // synPanesMinToSize(panesList, bIndex + 1, lastIndex) // It wont run
          paneB.maxSize = maxPaneSize - sum
          return

        case value === 0:
          sum += paneA.resetMin()
          sum += paneB.resetMax()
          return

        case value > 0:
          sum += paneB.resetMax()
          // synPanesMaxToSize(panesList, 0, aIndex - 1) // It wont Run
          paneA.minSize = maxPaneSize - sum
          return
      }

      // ---------------------------------------------------------------------------------
    default:
      console.error('v---------------------------------------------------------------')
      break
  }
  // paneConsole('minSize')
  // paneConsole('maxSize')
  minMaxLogicUp(panesList, <number>nextValue, nextAIndex, nextBIndex, sum, maxPaneSize)
}

// eslint-disable-next-line complexity
export const minMaxLogicDown = (
  panesList: PaneModel[], value: number, aIndex: number, bIndex: number, sum = 0, maxPaneSize: number) => {
  const lastIndex = panesList.length - 1
  // keyConsole({aIndex, bIndex, value, sum})
  let nextValue: number | undefined
  let nextAIndex = aIndex
  let nextBIndex = bIndex
  const paneA = panesList[aIndex]
  const paneB = panesList[bIndex]
  switch (true) {
    // total 6 combination
    case aIndex > 0 && bIndex < lastIndex:
      switch (true) {
        case value < 0:
          sum += paneA.resetMax()
          nextAIndex = aIndex - 1
          nextValue = panesList[nextAIndex].getMaxDiff() + value
          break

        case value === 0:
          sum += paneA.resetMax()
          sum += paneB.resetMin()
          nextAIndex = aIndex - 1
          nextBIndex = bIndex + 1
          nextValue = panesList[nextAIndex].getMaxDiff() - panesList[nextBIndex].getMinDiff()
          break

        case value > 0:
          sum += paneB.resetMin()
          nextBIndex = bIndex + 1
          nextValue = value - panesList[nextBIndex].getMinDiff()
          break
      }
      break
      // ---------------------------------------------------------------------------------
    case aIndex === 0 && bIndex < lastIndex:
      switch (true) {
        case value < 0:
          sum += paneA.resetMax()
          sum += synPanesMinToSize(panesList, bIndex + 1, lastIndex)
          paneB.minSize = maxPaneSize - sum
          return

        case value === 0:
          sum += paneA.resetMax()
          sum += paneB.resetMin()
          sum += synPanesMinToSize(panesList, bIndex + 1, lastIndex)
          return

        case value > 0:
          // not change from previous switch
          sum += paneB.resetMin()
          nextBIndex = bIndex + 1
          nextValue = value - panesList[nextBIndex].getMinDiff()
          break
      }
      break
      // ---------------------------------------------------------------------------------
    case aIndex > 0 && bIndex === lastIndex:
      switch (true) {
        case value < 0:
          sum += paneA.resetMax()
          nextAIndex = aIndex - 1
          nextValue = panesList[nextAIndex].getMaxDiff() + value
          break

        case value === 0:
          sum += paneA.resetMax()
          sum += paneB.resetMin()
          sum += synPanesMaxToSize(panesList, 0, aIndex - 1)
          return

        case value > 0:
          sum += paneB.resetMin()
          sum += synPanesMaxToSize(panesList, 0, aIndex - 1)
          paneA.maxSize = maxPaneSize - sum
          return
      }
      break
      // ---------------------------------------------------------------------------------
      // @ts-ignore
    case aIndex === 0 && bIndex === lastIndex:
      // return for every case
      switch (true) {
        case value < 0:
          sum += paneA.resetMax()
          // synPanesMinToSize(panesList, bIndex + 1, lastIndex) // It wont run
          paneB.minSize = maxPaneSize - sum
          return

        case value === 0:
          sum += paneB.resetMin()
          sum += paneA.resetMax()
          return

        case value > 0:
          sum += paneB.resetMin()
          // synPanesMaxToSize(panesList, 0, aIndex - 1) // It wont Run
          paneA.maxSize = maxPaneSize - sum
          return
      }

      // ---------------------------------------------------------------------------------
    default:
      console.error('v---------------------------------------------------------------')
      break
  }

  minMaxLogicDown(panesList, <number>nextValue, nextAIndex, nextBIndex, sum, maxPaneSize)
}

export const visibilityOperation = (index: number, panesList: PaneModel[],
  sizeChange: number, visibility: boolean) => {
  const operationKey = visibility ? 'removeVisibilitySize' : 'addVisibilitySize'

  for (let i = index - 1; i > MINUS_ONE; i--) {
    sizeChange = panesList[i][operationKey](sizeChange)
  }

  for (let i = index + 1; i < panesList.length; i++) {
    sizeChange = panesList[i][operationKey](sizeChange)
  }
}

export const visibilityOperationHideResizer = (index: number, panesList: PaneModel[],
  sizeChange: number, visibility: boolean) => {
  const operationKey = visibility ? 'removeVisibilitySize' : 'addVisibilitySize'

  for (let i = index; i > MINUS_ONE; i--) {
    sizeChange = panesList[i][operationKey](sizeChange)
  }

  for (let i = index + 1; i < panesList.length; i++) {
    sizeChange = panesList[i][operationKey](sizeChange)
  }
}

export const getMaxContainerSizes = ({getContainerRect, vertical, panesList, resizersList} :IContextDetails) => {
  const {top, height, left, width} = getContainerRect()
  const maxTopAxis = vertical ? left : top
  const containerSize = (vertical ? width : height)
  const maxPaneSize = containerSize - getResizerSum(resizersList, 0, panesList.length - 2)

  // console.log('mas Size limits', maxPaneSize,
  //   getPanesSizeSum(panesList, 0, panesList.length - 1), getResizerSum(resizersList, 0, panesList.length - 2))
  return {
    containerSize,
    maxTopAxis,
    maxPaneSize
  }
}

export const registerContainer = (context: any) => (node: any) => {
  context.registerContainer({getContainerRect: () => node.getBoundingClientRect()})
}

// getMaxContainerSizes need to use this
// export const toRatioModeFn = (panesList: PaneModel[], resizersList: ResizerModel[], containerSize: number) => {
export const toRatioModeFn = (contextDetails: IContextDetails) => {
  const {panesList, resizersList} = contextDetails

  const {maxPaneSize} = getMaxContainerSizes(contextDetails)

  // add for last no visible pane also
  // const resizerSum = getSum(resizersList, (resizer) => resizer.resizerSize)
  // console.log('v-- toRatioModeFn', resizerSum, containerSize, maxPaneSize)

  const maxRatioValue = getPanesSizeSum(panesList, 0, panesList.length - 1)
  console.log('v--', 'toRatioModeFn')
  panesList
    .forEach((pane: PaneModel) => {
      pane.toRatioMode(maxPaneSize, maxRatioValue)
    })

  const sizeSum = getPanesSizeSum(panesList, 0, panesList.length - 1)
  const leftOverTotalSize = maxPaneSize - sizeSum
  const changeOperation = leftOverTotalSize < 0 ? MINUS : PLUS
  change1PixelToPanes(panesList, Math.abs(leftOverTotalSize), changeOperation)

  setUISizesOfAllElement(panesList, resizersList)
}
