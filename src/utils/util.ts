import {IAnyMap, IPaneModelKey} from '../@types'
import {PaneModel} from '../models/pane-model'

export const noop = (_: any): any => _

export const findById = (list: PaneModel[], _id: string) =>
  list.find(({id}) => id === _id)

export const createMap = (paneList: PaneModel[], ...keys: IPaneModelKey[]) => {
  const map: IAnyMap = {}
  paneList.forEach((pane) => {
    const {id} = pane
    if (keys.length === 1) {
      map[id] = pane[keys[0]]
    } else {
      map[id] = keys.reduce((acc: any, key) => {
        acc[key] = pane[key]
        return acc
      }, {})
    }
  })
  return map
}

export const isUndefinedOrNull = (value: any) => value === undefined || value === null

export const findIndex = (list: any[], value: any, key = 'id') =>
  list.findIndex((item) => item[key] === value)

export const ratioToNumber = (totalSize: number, maxRatioValue: number, size: number) =>
  Number((totalSize * (size / maxRatioValue)).toFixed(0))

export const addDefaultProps = (props: any, defaultProps: any) => {
  const keys = Object.keys({...props, ...defaultProps})
  const newProps: any = {}

  for (const key of keys) {
    newProps[key] = props[key] === undefined ? defaultProps[key] : props[key]
  }
  return newProps
}
