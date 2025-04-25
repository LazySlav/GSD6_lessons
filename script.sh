#!/bin/bash

# Check if any files were provided as arguments
if [ $# -eq 0 ]; then
    echo "No input files provided. Please specify the JPEG files as arguments."
    exit 1
fi

# Define the output file name
output_file="output.mp4"

# Define the duration for each image in seconds
duration=3

# Define the frame rate (frames per second)
fps=1/$duration

# Create a temporary text file listing the input files
echo "Creating temporary video files..."
for file in "$@"; do
    if [ ! -f "$file" ]; then
        echo "Error: File '$file' not found."
        exit 1
    fi
    if [ "${file: -4}" != ".jpg" ] && [ "${file: -5}" != ".jpeg" ]; then
        echo "Error: File '$file' is not a JPEG file."
        exit 1
    fi
    temp_file="${file%.jpg}.mp4"
    ffmpeg -loop 1 -y -i "$file" -vf "crop=1200:1020:343:33" -c:v libx264 -t $duration -pix_fmt yuv420p $temp_file
done

# Create a temporary text file listing the temporary video files
echo "Creating temporary file list..."
for file in "$@"; do
    temp_file="${file%.jpg}.mp4"
    echo "file '$temp_file'" >> input_list.txt
done

# Use FFmpeg to concatenate the temporary video files
echo "Creating final video..."
ffmpeg -f concat -safe 0 -i input_list.txt -c:v libx264 -crf 18 -pix_fmt yuv420p $output_file

# Remove the temporary files
echo "Cleaning up..."
for file in "$@"; do
    temp_file="${file%.jpg}.mp4"
    rm $temp_file
done
rm input_list.txt

