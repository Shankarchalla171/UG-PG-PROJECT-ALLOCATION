package com.selab.backend.services;

import com.selab.backend.Dto.StudentDto;
import com.selab.backend.Dto.StudentProfileRequest;
import com.selab.backend.Dto.UpdateProfileRequest;
import com.selab.backend.auth.JwtService;
import com.selab.backend.exceptions.UserNotFoundException;
import com.selab.backend.mappers.StudentMapper;
import com.selab.backend.models.Role;
import com.selab.backend.models.Student;
import com.selab.backend.models.User;
import com.selab.backend.repositories.StudentRepository;
import com.selab.backend.repositories.UserRepository;
import com.selab.backend.utils.FileValidator;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final StudentMapper studentMapper;

    public Student getStudentProfile(User user) {
        return studentRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("profile for user with name"+user.getUsername()+" not found"));
    }

    @Transactional
    public Student createStudent(StudentProfileRequest studentProfileRequest, User user) {
        String baseDir = System.getProperty("user.dir") + File.separator+"uploads";
        String resumeDir = baseDir+File.separator + "resume";
        String profilePhotoDir = baseDir+File.separator + "profilePhoto";

        MultipartFile photo= studentProfileRequest.getProfilePhoto();
        MultipartFile resume= studentProfileRequest.getResume();

        FileValidator.validateImage(photo,2 * 1024 * 1024);//2MB;
        FileValidator.validatePdf(resume, 5 * 1024 * 1024);//5MB

        try{
            new File(resumeDir).mkdirs();
            new File(profilePhotoDir).mkdirs();

            String resumeName=user.getId()+"_"+resume.getOriginalFilename();
            Path resumePath= Paths.get(resumeDir,resumeName);
            String relativeResumePath="uploads/"+"resume/"+resumeName;

            String profilePhotoName=user.getId()+"_"+photo.getOriginalFilename();
            Path profilePhotoPath=Paths.get(profilePhotoDir,profilePhotoName);
            String relativePhotoPath="uploads/"+"profilePhoto/"+profilePhotoName;

            resume.transferTo(resumePath);
            photo.transferTo(profilePhotoPath);

            user.setRole(Role.STUDENT);
            userRepository.save(user);

            Student student= Student.builder()
                    .name(studentProfileRequest.getName())
                    .departmentName(studentProfileRequest.getDepartmentName())
                    .collegeEmailId(studentProfileRequest.getCollegeEmailId())
                    .rollNumber(studentProfileRequest.getRollNo())
                    .resumePath(relativeResumePath)
                    .profilePhotoLink(relativePhotoPath)
                    .user(user)
                    .build();
            return studentRepository.save(student);

        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student update( UpdateProfileRequest request, User user) {
        String baseDir = System.getProperty("user.dir") + File.separator+"uploads";
        String resumeDir = baseDir+File.separator + "resume";
        String profilePhotoDir = baseDir+File.separator + "profilePhoto";

        Student student = studentRepository.findByUser(user).orElseThrow(( ) -> new UserNotFoundException("user with "+user.getUsername()+"  not found"));

        if(request.getProfilePhoto() != null && !request.getProfilePhoto().isEmpty() ){
               MultipartFile photo = request.getProfilePhoto();


               FileValidator.validateImage(photo,3 * 1024 * 1024 );


              try{
                  if(student.getProfilePhotoLink() != null) {
                      Path oldPhoto = Paths.get(System.getProperty("user.dir"), student.getProfilePhotoLink());
                      Files.deleteIfExists(oldPhoto);
                  }

                  String photoName=user.getId()+"_"+photo.getOriginalFilename();
                  Path photoPath=Paths.get(profilePhotoDir,photoName);
                  photo.transferTo(photoPath);
                  String relativePath="uploads/profilePhoto/"+photoName;
                  student.setProfilePhotoLink(relativePath);

              } catch (Exception e) {
                  throw new RuntimeException(e.getMessage());
              }

        }

        if(request.getResume() != null && !request.getResume().isEmpty()){
            MultipartFile resume = request.getResume();
            FileValidator.validatePdf(resume,5 * 1024 * 1024);

            try{
                if(student.getResumePath() != null) {
                    Path oldResume = Paths.get(System.getProperty("user.dir"), student.getResumePath());
                    Files.deleteIfExists(oldResume);
                }

                String fileName=user.getId()+"-"+resume.getOriginalFilename();
                Path  filePath=Paths.get(resumeDir,fileName);
                resume.transferTo(filePath);
                String relativeFilePath="uploads/resume/"+fileName;
                student.setResumePath(relativeFilePath);

            } catch (Exception e) {
                throw new RuntimeException(e.getMessage());
            }
        }

        studentMapper.updateStudent(request,student);
       return  studentRepository.save(student);
    }
}
