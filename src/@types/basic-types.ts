import {PaneModel} from '../models'

export type IHiddenResizer = 'left' | 'right' | 'none'

export type UnitTypes = 'ratio' | 'pixel' | undefined

export type addAndRemoveType = '+'| '-'

export type IPaneModelKey = keyof PaneModel

export type IPaneNumericKeys = 'size' | 'defaultSize' | 'minSize' | 'maxSize' | 'defaultMinSize' | 'defaultMaxSize'

export type IBooleanOrUndefined = boolean | undefined
export type IStringOrUndefined = string | undefined

export type IVisibilityState = 'zipped' | 'visible' | 'hidden'

export type IClearFlagsParam = 'setSize' | 'ratio' | 'visibility' | ''
export type ISetSizeBehaviour = 'ratio' | 'buttom_first' | 'top_first'
