import 'dotenv/config';
import express, { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from './db.js';
import { students, NewStudent } from './schema.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

interface StudentRequestBody {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
}


app.get('/api/students', async (_req: Request, res: Response) => {
  try {
    const result = await db.select().from(students);
    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});


app.get('/api/students/:id', async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  try {
    const result = await db.select().from(students).where(eq(students.id, id));

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลนักศึกษารหัสนี้',
      });
    }

    return res.status(200).json({
      success: true,
      data: result[0],
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});


app.post('/api/students', async (req: Request<{}, {}, StudentRequestBody>, res: Response) => {
  const { id, firstName, lastName, birthDate, gender } = req.body;

  if (!id || !firstName || !lastName || !birthDate || !gender) {
    return res.status(400).json({
      success: false,
      message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง (id, firstName, lastName, birthDate, gender)',
    });
  }

  try {
    const newStudentData: NewStudent = {
      id: String(id), // แปลงเป็น String เพื่อความชัวร์
      firstName,
      lastName,
      birthDate,
      gender,
    };

    const newStudent = await db
      .insert(students)
      .values(newStudentData)
      .returning();

    return res.status(201).json({
      success: true,
      message: 'เพิ่มข้อมูลนักศึกษาสำเร็จ',
      data: newStudent[0],
    });
  } catch (err: any) {
    if (err.code === '23505' || err.message?.includes('unique constraint')) {
      return res.status(400).json({
        success: false,
        message: 'รหัสนักศึกษานี้มีอยู่ในระบบแล้ว',
      });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
});


app.put('/api/students/:id', async (req: Request<{ id: string }, {}, Partial<StudentRequestBody>>, res: Response) => {
  const { id } = req.params;
  const { firstName, lastName, birthDate, gender } = req.body;

  try {
    const updateData: Partial<NewStudent> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (birthDate !== undefined) updateData.birthDate = birthDate;
    if (gender !== undefined) updateData.gender = gender;

    const result = await db
      .update(students)
      .set(updateData)
      .where(eq(students.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลนักศึกษาที่ต้องการแก้ไข',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'แก้ไขข้อมูลนักศึกษาสำเร็จ',
      data: result[0],
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});


app.delete('/api/students/:id', async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;

  try {
    const result = await db
      .delete(students)
      .where(eq(students.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลนักศึกษาที่ต้องการลบ',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'ลบข้อมูลนักศึกษาสำเร็จ',
      data: result[0],
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;