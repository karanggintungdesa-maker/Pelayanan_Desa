
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
    title: 'Profil Desa Karanggintung',
    description: 'Profil lengkap Desa Karanggintung, Kecamatan Gandrungmangu, Kabupaten Cilacap, meliputi sejarah, kondisi geografis, demografi, dan potensi desa.',
};

export default function ProfilDesaPage() {
    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <header className="text-center mb-10">
                <h1 className="text-4xl font-bold font-headline text-primary">Profil Desa Karanggintung</h1>
                <p className="text-lg text-muted-foreground mt-1">Kecamatan Gandrungmangu, Kabupaten Cilacap, Provinsi Jawa Tengah</p>
            </header>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>1. Gambaran Umum</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none text-muted-foreground">
                        <p>Desa Karanggintung merupakan salah satu desa di Kecamatan Gandrungmangu, Kabupaten Cilacap, Provinsi Jawa Tengah. Desa ini memiliki karakter sebagai wilayah pedesaan dengan basis ekonomi agraris yang kuat serta didukung oleh aktivitas sosial masyarakat yang masih menjunjung tinggi nilai gotong royong.</p>
                        <p>Desa Karanggintung terus berkembang melalui pembangunan berbasis partisipasi masyarakat dan penguatan pelayanan publik menuju desa yang lebih maju dan mandiri.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>2. Sejarah Desa</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none text-muted-foreground">
                        <p>Sejarah Desa Karanggintung berkembang dari cerita masyarakat yang diwariskan secara turun-temurun. Nama “Karanggintung” diyakini berasal dari kondisi geografis wilayah yang memiliki unsur tanah keras (karang) dan karakter lahan tertentu yang khas.</p>
                        <p>Pada awalnya, wilayah desa berupa kawasan alami yang kemudian dibuka oleh masyarakat dan berkembang menjadi permukiman serta lahan pertanian. Seiring waktu, desa ini tumbuh menjadi wilayah dengan kehidupan sosial yang stabil dan terorganisir.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>3. Letak Geografis dan Batas Wilayah</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none text-muted-foreground">
                         <p>Desa Karanggintung terletak di wilayah Kecamatan Gandrungmangu dengan kondisi geografis dataran rendah hingga bergelombang.</p>
                        <h3 className="font-semibold text-foreground">Kondisi Geografis</h3>
                        <ul>
                            <li><strong>Ketinggian:</strong> ±25–100 mdpl</li>
                            <li><strong>Topografi:</strong> Dataran rendah</li>
                            <li><strong>Kemiringan tanah:</strong> Relatif landai</li>
                        </ul>
                        <p>Kondisi ini sangat mendukung aktivitas pertanian sebagai sektor utama masyarakat.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>4. Iklim</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none text-muted-foreground">
                        <p>Desa Karanggintung beriklim tropis dengan karakteristik:</p>
                        <ul>
                            <li><strong>Suhu rata-rata:</strong> 32–36°C</li>
                            <li><strong>Kelembaban:</strong> 55–70%</li>
                            <li><strong>Curah hujan:</strong> Relatif rendah–sedang</li>
                            <li>Memiliki dua musim: hujan dan kemarau</li>
                        </ul>
                        <p>Iklim ini berpengaruh terhadap pola tanam dan kegiatan pertanian masyarakat.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>5. Kependudukan</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none text-muted-foreground">
                        <p>Penduduk Desa Karanggintung didominasi oleh usia produktif, yang menjadi potensi besar dalam pengembangan ekonomi desa.</p>
                        <h3 className="font-semibold text-foreground">Karakteristik Penduduk</h3>
                        <ul>
                            <li>Persebaran penduduk merata di dusun</li>
                            <li>Struktur sosial berbasis kekeluargaan</li>
                            <li>Tingkat partisipasi masyarakat tinggi</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>6. Pembagian Administratif</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none text-muted-foreground">
                        <p>Struktur wilayah Desa Karanggintung terdiri dari:</p>
                        <ul className="list-disc pl-5">
                            <li>
                                <strong>Dusun:</strong> 5 dusun, yaitu:
                                <ul className="list-[circle] pl-5 mt-1">
                                    <li>Pagurgunung</li>
                                    <li>Karanggintung</li>
                                    <li>Sindangraja</li>
                                    <li>Penumbang</li>
                                    <li>Karangtawang</li>
                                </ul>
                            </li>
                            <li className="mt-1"><strong>RW:</strong> 6 RW</li>
                            <li><strong>RT:</strong> 51 RT</li>
                        </ul>
                        <p>Struktur ini mendukung sistem pemerintahan desa dalam pelayanan administrasi dan pembangunan.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>7. Kondisi Sosial dan Budaya</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none text-muted-foreground">
                        <p>Masyarakat Desa Karanggintung memiliki kehidupan sosial yang harmonis dengan nilai budaya yang kuat.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                            <div>
                                <h3 className="font-semibold text-foreground">Ciri Sosial</h3>
                                <ul>
                                    <li>Gotong royong tinggi</li>
                                    <li>Solidaritas masyarakat kuat</li>
                                    <li>Kegiatan musyawarah desa aktif</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Kegiatan Masyarakat</h3>
                                <ul>
                                    <li>Kegiatan PKK</li>
                                    <li>Posyandu</li>
                                    <li>Pengajian dan kegiatan keagamaan</li>
                                    <li>Peringatan hari besar nasional</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>8. Kondisi Ekonomi</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none text-muted-foreground">
                        <h3 className="font-semibold text-foreground">Mata Pencaharian</h3>
                        <p>Sebagian besar masyarakat bekerja sebagai:</p>
                        <ul>
                            <li>Petani</li>
                            <li>Buruh tani</li>
                            <li>Pedagang kecil</li>
                            <li>Pekerja sektor informal</li>
                        </ul>
                        <h3 className="font-semibold text-foreground">Potensi Ekonomi</h3>
                        <ul>
                            <li>Pertanian (padi dan tanaman pangan)</li>
                            <li>Peternakan</li>
                            <li>UMKM desa</li>
                        </ul>
                        <p>Kondisi tanah yang subur menjadi faktor utama dalam menunjang sektor pertanian.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>9. Infrastruktur dan Sarana</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none text-muted-foreground">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                            <div>
                                <h3 className="font-semibold text-foreground">Infrastruktur</h3>
                                <ul>
                                    <li>Jalan desa tersedia (sebagian perlu peningkatan)</li>
                                    <li>Infrastruktur pertanian tersedia</li>
                                    <li>Akses antar dusun cukup baik</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Sarana Umum</h3>
                                <ul>
                                    <li>Balai desa</li>
                                    <li>Posyandu</li>
                                    <li>Fasilitas pendidikan dasar</li>
                                    <li>Tempat ibadah</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>10. Potensi dan Pengembangan Desa</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none text-muted-foreground">
                        <p>Desa Karanggintung memiliki potensi yang dapat terus dikembangkan.</p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                            <div>
                                <h3 className="font-semibold text-foreground">Potensi Unggulan</h3>
                                <ul>
                                    <li>Pertanian produktif</li>
                                    <li>Tenaga kerja usia produktif</li>
                                    <li>UMKM</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Arah Pengembangan</h3>
                                <ul>
                                    <li>Peningkatan kualitas infrastruktur</li>
                                    <li>Pengembangan ekonomi masyarakat</li>
                                    <li>Pemberdayaan UMKM</li>
                                    <li>Peningkatan kualitas SDM</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>11. Status Perkembangan Desa</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none text-muted-foreground">
                        <p>Berdasarkan kondisi saat ini, Desa Karanggintung termasuk dalam kategori:</p>
                        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 my-4 rounded-md">
                            <p className="font-bold text-lg">➡️ Desa Berkembang</p>
                        </div>
                        <p>Hal ini ditandai dengan:</p>
                        <ul>
                            <li>Infrastruktur yang terus dibangun</li>
                            <li>Kegiatan ekonomi yang berjalan</li>
                            <li>Partisipasi masyarakat yang aktif dalam pembangunan</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>12. Penutup</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none text-muted-foreground">
                        <p>Desa Karanggintung merupakan desa dengan potensi besar di Kecamatan Gandrungmangu yang didukung oleh sektor pertanian, sumber daya manusia yang produktif, serta kehidupan sosial yang kuat.</p>
                        <p>Dengan pembangunan yang berkelanjutan dan partisipasi masyarakat yang tinggi, Desa Karanggintung memiliki peluang besar untuk berkembang menjadi desa yang lebih maju dan mandiri di masa mendatang.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
