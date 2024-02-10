//
//  CustomSettingsManager.m
//  SocialMap
//
//  Created by Rikako Hatoya on 2/10/24.
//

#import "CustomSettingsManager.h"

@implementation CustomSettingsManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getMapVersion:(RCTResponseSenderBlock)callback)
{
  NSString *mapVersion = [[NSUserDefaults standardUserDefaults] objectForKey:@"mapVersion"];
  NSLog(@"Map Version: %@", mapVersion);
  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
  NSLog(@"All user defaults: %@", [defaults dictionaryRepresentation]);

  if (!mapVersion) {
    mapVersion = @"default";
  }
  callback(@[mapVersion]);
}

@end
