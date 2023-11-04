import {useEffect} from 'react'
import {
  restoreDefaultFn
} from '../utils/api'
import {IGetMaP, IGetMapApiParam, IResizableApi, IResizableContext} from '../@types'
import {createMap} from '../utils/util'

export const useResizableApi = (context: IResizableContext, props: any) => {
  const {contextDetails, setVisibility} = context
  const {
    onReady
  } = props

  const restoreDefault = () => restoreDefaultFn(contextDetails)

  const getMap = (...keys: IGetMapApiParam[]): IGetMaP => {
    return createMap(contextDetails.panesList, ...keys)
  }

  useEffect(() => {
    const api: IResizableApi = {
      restoreDefault,
      setVisibility,
      getMap
    }

    onReady(api)
  }, [context])
}
