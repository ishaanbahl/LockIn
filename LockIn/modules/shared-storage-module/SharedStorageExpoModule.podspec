require 'json'

Pod::Spec.new do |s|
  s.name           = 'SharedStorageExpoModule'
  s.version        = '1.0.0'
  s.summary        = 'Expo module for App Group shared UserDefaults'
  s.description    = 'Reads and writes to App Group UserDefaults for sharing task data between the main app and Shield extension'
  s.author         = 'Ishaan Bahl'
  s.homepage       = 'https://github.com/ishaanbahl/lockin'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files   = 'ios/**/*.swift'
end
