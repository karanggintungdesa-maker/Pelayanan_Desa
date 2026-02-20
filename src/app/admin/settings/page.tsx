import { PageHeader } from '@/components/page-header';
import { SettingsForm } from './_components/settings-form';
import { LogoSettingsForm } from './_components/logo-settings-form';

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader
        title="Pengaturan"
        description="Atur kop surat untuk cetak dokumen dan logo desa yang tampil di aplikasi."
      />
      <div className="space-y-8">
        <SettingsForm />
        <LogoSettingsForm />
      </div>
    </>
  );
}
