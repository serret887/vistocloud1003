/**
 * Why Did You Render setup
 * This file should be imported at the very top of your app entry point
 * Only runs in development mode
 */
import React from 'react'

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  whyDidYouRender(React, {
    trackAllPureComponents: false, // Set to true to track all, but it's very verbose
    trackHooks: false, // Disable hook tracking to avoid React hook order errors
    logOnDifferentValues: true, // Log when values change
    collapseGroups: true, // Collapse similar logs
    hotReload: true, // Support hot reload
    // Don't track Zustand hooks as they can cause hook order issues with WDYR
    // trackExtraHooks: [
    //   [require('zustand'), 'useApplicationStore'],
    // ],
  })
}

