#!/usr/bin/python

###########################################################################################
###                                                                                     ###
###  Copyright 2007 by codeboje.de                                                      ###
###  Name    : Dir2Imago                                                                ###
###  Version : 0.1                                                                      ###
###  Author  : Azarai (azarai@codeboje.de)                                              ###
###  Licence : BSD                                                                      ###
###                                                                                     ###
###########################################################################################

import os
import stat
import Image
import shutil
import getopt
import sys

class Dir2ImagoGallery:
    __indir = None
    __destinationDir = None
    __galleryName = ''
    __output = ''
    __maxHeight = 75
    __maxWidth = 75
    __xmlInfo = '<?xml version="1.0" encoding="UTF-8"?>'
    __galleryStartPart1 = '<simpleviewerGallery maxImageHeight="1024" maxImageWidth="1024" textColor="0xFFFFFF" frameColor="0xffffff" frameWidth="20" stagePadding="40" thumbnailColumns="3" thumbnailRows="3" navPosition="left" title="'
    __galleryStartPart2 = '" enableRightClickOpen="true" backgroundImagePath="" thumbPath="thumbnails/" imagePath="images/" >'
    
    def __init__(self):
        try:
            options, arguments = getopt.getopt(sys.argv[1:], 'hg:i:o:', ['help', 'galleryName', 'inputDir', 'outputDir'])
            
        except getopt.GetoptError:
            self.logError()
        
        if len(options) == 0:
            self.logError()
            
        for o,a in options:
            if o in ('-h', '--help'):
                self.usage()
                sys.exit(0)
            
            if o in ('-i', '--inputDir'):
                self.__indir = a
                if not a.endswith("/") and not a.endswith("\\") :
                    self.__indir = a + "/"
                continue
                                
            if o in ('-o', '--outputDir'):
                self.__destinationDir = a
                if not a.endswith("/") and not a.endswith("\\") :
                    self.__destinationDir = a + "/"
                continue
            if o in ('-g', '--galleryName'):
                self.__galleryName = a              
                continue    
        if not self.__indir:
            self.logError("inputDir is required but not set; see usage for further instructions\n")
        if not self.__destinationDir:
            self.logError("outputDir is required but not set; see usage for further instructions\n")
        if not self.__galleryName:
            self.logError("galleryName is required but not set; see usage for further instructions\n")            

    def logError(self, text="You have specified an invalid option. see usage for further instructions\n"):
        print text
        self.usage()
        sys.exit(1)
        
    def usage(self):
        print 'Dir2ImagoGallery (dir2imago) usage:\n'
        print '\t-h, --help\tPrint this help screen'
        print '\t-i, --inputDir\tSpecify the input/src directory for your images\tREQUIRED'
        print '\t-o, --outputDir\tSpecify the out directory where the imago gallery folder will be created\tREQUIRED\n'
        print '\t-g, --galleryName\tSpecify the gallery name\tREQUIRED\n'
        print '\tEXAMPLE:\dir2imago.py -v -i c:/mypictures -o c:/uploading\n'
        
    def create(self):   
        self.__destinationDir += self.__galleryName
        if not os.path.exists(self.__destinationDir):
            os.mkdir(self.__destinationDir)
            os.mkdir(self.__destinationDir + "/thumbnails")
            os.mkdir(self.__destinationDir + "/images")
            
        for fileName in os.listdir (self.__indir):
            fileStats = os.stat ( self.__indir + fileName )
            if not stat.S_ISDIR ( fileStats [ stat.ST_MODE ] ):
                try:
                    originalImage = Image.open(self.__indir + fileName)
                    width, height = originalImage.size
                    if (width > height):
                        size= self.__maxWidth, (height/(width/self.__maxWidth))
                    else:
                        size= (width/(height/self.__maxHeight)), self.__maxHeight 
                    originalImage.thumbnail(size, Image.ANTIALIAS)
                    originalImage.save(self.__destinationDir + "/thumbnails/" + fileName, "JPEG")
                    shutil.copyfile(self.__indir + fileName,self.__destinationDir +"/images/" + fileName)
                    self.__output += '<image><filename>' + fileName + '</filename><caption></caption></image>'
                except IOError:
                    pass        
        galleryXML = file(self.__destinationDir + '/gallery.xml', 'w')
        galleryXML.write((self.__xmlInfo + "\n" + self.__galleryStartPart1 + self.__galleryName + self.__galleryStartPart2 + "\n" + self.__output + "\n</simpleviewerGallery>").encode('utf-8'))
        galleryXML.close()

if __name__ == '__main__':
    dir2imago = Dir2ImagoGallery()
    dir2imago.create()
