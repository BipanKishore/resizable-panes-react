import React, {useEffect, useRef, useState} from 'react'
import {ResizablePaneContext, getResizableContext} from '../context/resizable-panes-context'
import {ResizablePanes} from './resizable-panes'
import {noop} from '../utils/util'
import {useResizableApi} from '../hook/use-resizable-api'
// import {useMountingConsole} from '../utils/development-util'
import {onResizeClearSizesMapFromStore} from '../utils/storage'
import {IResizablePaneProviderProps} from '../@types'

export const ResizablePaneProvider = (props: IResizablePaneProviderProps) => {
  const {storeKey, sessionStore, visibility} = props
  const [context] = useState(getResizableContext(props))
  const ref = useRef(true)
  // context.storage.readPaneChange(toArray(children), context)
  useResizableApi(context, props)
  useEffect(() => {
    onResizeClearSizesMapFromStore(storeKey as string, sessionStore as boolean)
  }, [])

  useEffect(() => {
    if (ref.current === false) {
      context.setVisibility(visibility)
    } else {
      ref.current = false
    }
  }, [visibility, ref])

  // useEffect(() => {
  //   console.log('v-- contextDetails', context.contextDetails)
  // }, [context])
  // useMountingConsole('ResizablePaneProvider')
  return (
    <ResizablePaneContext.Provider value={context} >
      <ResizablePanes {...props}/>
    </ResizablePaneContext.Provider>
  )
}

ResizablePaneProvider.defaultProps = {
  onResize: noop,
  onResizeStop: noop,
  onReady: noop,
  onChangeVisibility: noop,
  vertical: false,
  storeKey: '',
  sessionStore: false,
  unit: undefined,
  resizer: undefined,
  resizerSize: 2,
  visibility: undefined
}
