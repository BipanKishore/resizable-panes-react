import {createContext} from 'react'
import {createMap, findById} from '../utils/util'
import {
  DIRECTIONS,
  DEFAULT_MAX_SIZE_KEY,
  DEFAULT_MIN_SIZE_KEY,
  RATIO,
  SET_SIZE,
  SIZE,
  VISIBILITY
} from '../constant'
import {
  createPaneModelListAndResizerModelList,
  getPanesAndResizers,
  restoreFn,
  setUISizesFn,
  syncAxisSizesFn,
  updatSizeStateAllPanes,
  setMaxLimits
} from '../utils/panes'
import {
  calculateAxes,
  setVirtualOrderList,
  movingLogic,
  setCurrentMinMax,
  toRatioModeAllPanes,
  getChangeInViewSize,
  getMaxContainerSizes
} from '../utils/resizable-pane'
import {getDirection, getSizeStyle, toArray} from '../utils/dom'
import {ResizeStorage, setStorage} from '../utils/storage'
import {
  IClearFlagsParam,
  IKeyToBoolMap,
  IResizableEvent,
  IResizablePaneProviderProps,
  ISetSizeBehaviour
} from '../@types'
import {ResizableModel} from '../models'
import {setVisibilityFn} from '../utils/visibility-helper'

import {setSizeMethod} from '../utils/set-size-helper'
import {
  getSize, registerResizableItem, setPaneOldVisibilityModel,
  synSizeToMaxSize, synSizeToMinSize, syncPaneRatioSizeToSize
} from '../models/pane'
import {attachDetectionCoordinate, detectionService} from '../services/detection-service'
import {consoleGetSize} from '../utils/development-util'

export const getResizableContext = (
  props: IResizablePaneProviderProps
): ResizableModel => {
  const {
    vertical,
    children,
    unit,
    uniqueId,
    storageApi,
    onResizeStop,
    onChangeVisibility,
    onResize
  } = props

  const myChildren = toArray(children)

  // reference will never change for these items: storage,
  // panesList, PaneModels, resizersList, ResizerModels
  const storage = new ResizeStorage(uniqueId, storageApi, myChildren)
  const items = createPaneModelListAndResizerModelList(
    myChildren,
    props,
    storage
  )
  // const resizersList = createResizerModelList(myChildren, props, storage)
  // reference will never change for these items: storage, panesList, resizersList

  const [panesList, resizersList] = getPanesAndResizers(items)

  const resizable = new ResizableModel()
  resizable.register({
    vertical,
    items,
    panesList,
    resizersList
  })

  const syncAxisSizes = () => syncAxisSizesFn(items)
  const emitResize = () => {
    const resizeParams = getIdToSizeMap()
    onResize(resizeParams)
  }
  const afterResizeStop = () => {
    const resizeParams = getIdToSizeMap()
    onResizeStop(resizeParams)
    setStorage(uniqueId, storageApi, resizable)
    attachDetectionCoordinate(resizable)
  }

  const emitChangeVisibility = () => {
    const map = getVisibilityState()
    onChangeVisibility(map)
  }

  const registerItem = (api: any, id: string) => {
    registerResizableItem(findById(items, id), api)
  }

  const registerContainer = (node: HTMLElement) => {
    resizable.getContainerRect = () => node.getBoundingClientRect()
    let visibilityMap = props.visibility
    if (storage.empty && unit === RATIO && !resizable.isSetRatioMode) {
      toRatioModeAllPanes(resizable)
      resizable.isSetRatioMode = true
    } else {
      const {panes} = storage.getStorage(uniqueId, storageApi)
      visibilityMap = createMap(panes, VISIBILITY)
    }
    setVisibilities(visibilityMap)
    detectionService(node, resizable)
  }

  const getIdToSizeMap = () => createMap(panesList, SIZE)
  const getVisibilityState = () => createMap(panesList, VISIBILITY)

  const setMouseDownFlag = (isMouseDown: boolean) => {
    resizersList.forEach(({api}) => {
      api.setMouseDownFlag(resizable.handleId, isMouseDown)
    })
  }

  const setMouseDownDetails = ([mouseCoordinate]: IResizableEvent, handleId: string) => {
    resizable.register({
      handleId,
      direction: DIRECTIONS.NONE,
      axisCoordinate: mouseCoordinate
    })
    console.log(handleId, mouseCoordinate)
    setMouseDownFlag(true)
    syncAxisSizes()
  }

  resizable.onMouseDown = setMouseDownDetails

  const clearflagsOnNewView = (except: IClearFlagsParam) => {
    if (except !== RATIO) {
      panesList.forEach(syncPaneRatioSizeToSize)
    }
    if (except !== VISIBILITY) {
      resizable.newVisibilityModel = false
    }
    if (except !== SET_SIZE) {
      resizable.setSizeKey = null
    }
  }

  const onNewView = (except: IClearFlagsParam = '') => {
    clearflagsOnNewView(except)
    updatSizeStateAllPanes(panesList)
  }

  const calculateAndSetHeight = ([mouseCoordinate, movement]: IResizableEvent) => {
    if (resizable.isViewSizeChanged || !movement) {
      return
    }

    setDirection(mouseCoordinate, movement)
    const isAxisLimitReached = setAxisConfig(mouseCoordinate)

    if (isAxisLimitReached) {
      movingLogic(mouseCoordinate, resizable)
    }
    setUISizesFn(items, resizable.direction)
    onNewView()
    emitResize()
  }

  resizable.resizeOnMove = calculateAndSetHeight

  const setDirection = (mouseCoordinate: number, movement: number) => {
    const {direction} = resizable
    const currentDirection = getDirection(movement)

    if (currentDirection !== direction) {
      resizable.direction = currentDirection
      directionChangeActions(mouseCoordinate)
    }
  }

  const directionChangeActions = (mouseCoordinate: number) => {
    resizable.axisCoordinate = mouseCoordinate

    setVirtualOrderList(resizable)

    syncAxisSizes()
    setCurrentMinMax(resizable)
    calculateAxes(resizable)
  }

  const setAxisConfig = (mouseCoordinate: number) => {
    const {topAxis, bottomAxis} = resizable

    if (mouseCoordinate <= topAxis) {
      setMaxLimits(resizable, synSizeToMinSize, synSizeToMaxSize, DIRECTIONS.UP)
      syncAxisSizes()
      resizable.axisCoordinate = topAxis
      return false
    } else if (mouseCoordinate >= bottomAxis) {
      setMaxLimits(resizable, synSizeToMaxSize, synSizeToMinSize, DIRECTIONS.DOWN)
      syncAxisSizes()
      resizable.axisCoordinate = bottomAxis
      return false
    }
    return true
  }

  const getPaneSizeStyle = (id: string) => {
    const size = getSize(findById(panesList, id))
    return getSizeStyle(vertical, size)
  }

  const reflectVisibilityChange = () => {
    setUISizesFn(items, DIRECTIONS.NONE)
    afterResizeStop()
    emitChangeVisibility()
    onNewView(VISIBILITY)
  }

  // It is getting default empty Object param
  const setVisibilities = (param: IKeyToBoolMap) => {
    const {newVisibilityModel} = resizable

    const currentVisibilityMap = createMap(panesList, VISIBILITY)

    const newMap = {
      ...currentVisibilityMap,
      ...param
    }

    if (!newVisibilityModel) {
      resizable.newVisibilityModel = true
      panesList.forEach(setPaneOldVisibilityModel)
    }

    setVisibilityFn(resizable, newMap)
    const changeInViewSize = getChangeInViewSize(resizable)
    resizable.isViewSizeChanged = !!changeInViewSize
    reflectVisibilityChange()
  }

  const onMoveEndFn = () => {
    afterResizeStop()

    setMouseDownFlag(false)
    consoleGetSize(resizable.items)
  }

  resizable.onMouseUp = onMoveEndFn

  const restore = () => {
    restoreFn(resizable.items)
    onNewView()
    afterResizeStop()
    emitChangeVisibility()
    resizable.isViewSizeChanged = false
  }

  const getState = () =>
    createMap(panesList, SIZE, VISIBILITY, DEFAULT_MIN_SIZE_KEY, DEFAULT_MAX_SIZE_KEY)
  const getVisibilities = () => getVisibilityState()

  const postSetSize = () => {
    setUISizesFn(items, DIRECTIONS.NONE)
    afterResizeStop()
    onNewView(SET_SIZE)
  }

  const setSize = (
    id: string,
    newSize: number,
    behavior?: ISetSizeBehaviour
  ) => {
    setSizeMethod(resizable, id, newSize, behavior)
    postSetSize()
  }

  const setSizeRatio = (
    id: string,
    percent: number,
    behavior?: ISetSizeBehaviour) => {
    const {containerSize} = getMaxContainerSizes(resizable)
    const newSize = containerSize * percent
    setSizeMethod(resizable, id, newSize, behavior)
    postSetSize()
  }

  const api = {
    restore,
    setVisibilities,
    getSizes: getIdToSizeMap,
    getVisibilities,
    getState,
    setSize,
    setSizeRatio
  }

  resizable.register(
    {
      api,
      registerItem,
      registerContainer,
      vertical,
      props,
      getPaneSizeStyle
    }
  )
  return resizable
}

export const ResizablePaneContext = createContext({} as ResizableModel)
