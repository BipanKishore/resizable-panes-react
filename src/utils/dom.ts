import {
  IResizableEvent, IJoinClassNameParam,
  UnitTypes, IBooleanOrUndefined, ISizeStyle
} from '../@types'
import {DIRECTIONS, RATIO, ZERO} from '../constant'

export const toPx = (size: number) => `${size}px`
export const getSizeKey = (vertical: boolean) => vertical ? 'width' : 'height'
export const getSizeStyle = (vertical: IBooleanOrUndefined, size: number): ISizeStyle => ({
  [getSizeKey(vertical as boolean)]: toPx(size)
})

export const joinClassName = (param: IJoinClassNameParam, notRequired: boolean | any = false) => {
  if (notRequired) {
    return ''
  }
  const keys = Object.keys(param)
  return keys.map((key) => param[key] ? key : '').join(' ')
}

export const getContainerClass = (vertical: boolean, className: string, unit: UnitTypes) =>
  joinClassName({
    'd-flex': true,
    'f-row w-fit-content': vertical,
    'f-column': !vertical,
    'h-100p': vertical,
    'w-100p h-100p': unit === RATIO,
    [className]: className
  })

export const isTouchEvent = (event: any) => event.type.startsWith('touch')

const resizableEvent = (mouseCoordinate: number, movement: number) => ({
  mouseCoordinate,
  movement
})

export const getResizableEventFromTouch = (e: any, vertical: boolean, previousTouchEvent: any): IResizableEvent => {
  const currentTouch = e.targetTouches[0]
  const {pageX = 0, pageY = 0} = previousTouchEvent.current ?? {}
  previousTouchEvent.current = currentTouch
  if (vertical) {
    return resizableEvent(currentTouch.clientX, currentTouch.pageX - pageX)
  } else {
    return resizableEvent(currentTouch.clientY, currentTouch.pageY - pageY)
  }
}

export const getResizableEventFromMouse = (e: any, vertical: boolean): IResizableEvent => {
  e.preventDefault()
  const {clientX, clientY, movementX, movementY} = e
  return vertical ? resizableEvent(clientX, movementX) : resizableEvent(clientY, movementY)
}

export const getResizableEvent = (e: any, vertical: boolean, previousTouchEvent: any): IResizableEvent => {
  return isTouchEvent(e)
    ? getResizableEventFromTouch(e, vertical, previousTouchEvent)
    : getResizableEventFromMouse(e, vertical)
}

export const getDirection = (e: IResizableEvent) => e.movement < ZERO ? DIRECTIONS.UP : DIRECTIONS.DOWN

export const toArray = (items: any) => Array.isArray(items) ? items : [items]

export const getSetSize = (node: any, vertical: boolean,
  // eslint-disable-next-line complexity
  addOverFlowLogic = false, addMinSize: number = 0) => (size: number) => {
  // console.log(node, vertical, size)
  node.style[getSizeKey(vertical)] = toPx(size)
  if (addOverFlowLogic) {
    if (size === 0) {
      node.style.overflow = 'hidden'
    } else {
      node.style.overflow = 'visible'
    }
  }

  if (addMinSize) {
    const key: string = `min${vertical ? 'Width' : 'Height'}` as 'minWidth' | 'minHeight'
    node.style[key] = toPx(size === 0 ? size : addMinSize)
  }
}
