import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png"
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Supported formats: PDF, DOC, DOCX, JPG, PNG" },
        { status: 400 }
      );
    }

    // Generate unique filename using crypto instead of uuid
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Get file extension from original filename
    const originalName = file.name;
    const extension = originalName.substring(originalName.lastIndexOf("."));
    
    // Create unique filename using crypto
    const filename = `${crypto.randomBytes(16).toString('hex')}${extension}`;
    
    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Ignore error if directory already exists
    }
    
    // Write file to uploads directory
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return the relative path to be stored in database
    return NextResponse.json({ 
      path: `/uploads/${filename}`,
      filename: originalName,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
} 