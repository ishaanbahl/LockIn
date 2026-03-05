require 'json'

Pod::Spec.new do |s|
  s.name           = 'ScreenTimeExpoModule'
  s.version        = '1.0.0'
  s.summary        = 'Expo module bridging iOS Screen Time APIs to React Native'
  s.description    = 'Provides FamilyControls authorization, app picker, and ManagedSettings blocking via Expo Modules API'
  s.author         = 'Ishaan Bahl'
  s.homepage       = 'https://github.com/ishaanbahl/lockin'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files   = 'ios/**/*.swift'

  s.frameworks     = 'FamilyControls', 'ManagedSettings', 'DeviceActivity'
end
