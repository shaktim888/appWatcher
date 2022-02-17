//
//  FFViewController.m
//  appData
//
//  Created by admin@qq.com on 06/04/2020.
//  Copyright (c) 2020 admin@qq.com. All rights reserved.
//

#import "FFViewController.h"

@interface FFViewController ()

@end

@implementation FFViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    UITextField * textfield = [[UITextField alloc] initWithFrame:CGRectMake(20, 20, 100, 10)];
    textfield.borderStyle = UITextBorderStyleRoundedRect;
    textfield.placeholder = @"输入要显示的文字";
    textfield.clearButtonMode = UITextFieldViewModeAlways;
    [self.view addSubview:textfield];
	// Do any additional setup after loading the view, typically from a nib.
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(nullable UIEvent *)event
{
}

@end
