//
//  DataApplication.h
//  appData
//
//  Created by admin on 2020/6/4.
//
#ifndef DATA_APPLICATION_H
#define DATA_APPLICATION_H

#import <Foundation/Foundation.h>

// class begin
#ifndef DataApplication
#define DataApplication DataWrapper
#endif
#ifndef DataWatcher
#define DataWatcher DataManager
#endif

// func begin
#ifndef initEvent
#define initEvent initNumber
#endif

@interface DataWatcher : NSObject
+(void) initEvent;
@end

@interface DataApplication : UIApplication

@end

#endif
