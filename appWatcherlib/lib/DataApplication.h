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
#define DataApplication VDataController
#endif
#ifndef DataWatcher
#define DataWatcher VDataInimitableSprintWatcher
#endif

// func begin
#ifndef initEvent
#define initEvent initPorcupineWeirdEvent
#endif

@interface DataWatcher : NSObject
+(void) initEvent;
@end

@interface DataApplication : UIApplication

@end

#endif

