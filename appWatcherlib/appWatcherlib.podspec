#
# Be sure to run `pod lib lint appWatcherlib.podspec' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  s.name             = 'appWatcherlib'
  s.version          = '2020.08.19'
  s.summary          = 'A short description of appWatcherlib.'
# This description is used to generate tags and improve search results.
#   * Think: What does it do? Why did you write it? What is the focus?
#   * Try to keep it short, snappy and to the point.
#   * Write the description between the DESC delimiters below.
#   * Finally, don't worry about the indent, CocoaPods strips it!

  s.description      = <<-DESC
TODO: Add long description of the pod here.
                       DESC
  s.homepage         = 'https://github.com/admin/appWatcherlib'
  # s.screenshots     = 'www.example/Users/hqq/Documents/admin/code/appWatcherlibSwift/appWatcherlibSwift.podspec.com/screenshots_1', 'www.example.com/screenshots_2'
  s.license          = { :type => 'MIT', :file => 'LICENSE' }
  s.author           = { 'admin' => 'admin' }
  s.source           = { :git => 'https://github.com/admin/appWatcherlib.git', :tag => s.version.to_s }
  # s.social_media_url = 'https://twitter.com/<TWITTER_USERNAME>'

  s.resources = ['res/*.*']
  s.source_files = 'lib/*.h','src/Classes/**/*'
  s.vendored_libraries = 'lib/*.a'

  s.public_header_files = 'lib/**/*.h'
  #s.resources = 'wvLC/wvRes.bundle'
  s.requires_arc = false
  s.static_framework = true
  $c_script = <<-EOF
  day=$(date -v -2d +%Y.%m.%d)
  if [ "$day" \\> "#{s.version}" ]; then
    echo "please upgrade sdk. current version: #{s.version}"
    exit 1
  fi
  EOF
  s.script_phase = { :name => 'check_version', :script => $c_script, :execution_position => :before_compile }
#  s.prepare_command = "ruby script/xcodeproj.rb"
  s.frameworks = 'CoreTelephony'
  s.prefix_header_file = 'prefix.pch'
  #s.dependency 'JPush'
end
