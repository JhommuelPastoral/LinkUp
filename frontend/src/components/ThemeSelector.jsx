import React from 'react'
import {THEMES} from '../constant/index.js'
import {useThemeStore} from '../store/useThemeStore.js'

export default function ThemeSelector() {
  const {theme, setTheme} = useThemeStore();
  return (
    <div className="dropdown w-full">
      <div tabIndex={0} role="button" className="btn m-1 w-full">Themes</div>
      <div tabIndex={0} className="dropdown-content bg-base-100 rounded-box shadow-lg mt-2 w-50 max-h-80 overflow-y-auto p-2 flex flex-col gap-3">
        {THEMES.map((themeOption) =>(
          <button
            key={themeOption.name}
            onClick={() => setTheme(themeOption.name)}
            className={`flex items-center btn btn-sm btn-ghost justify-start px-2 py-2 ${
              themeOption.name === theme ? 'btn-active' : ''
            }`}
          >
            <span className="capitalize text-xs font-semibold mb-1">{themeOption.label || themeOption.name}</span>
            <div className="flex gap-1">
              {themeOption.colors.map((color, i) => (
                <span
                  key={i}
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </button>

        ))}
      </div>
    </div> 
 )
}
