import { ISection } from "../../components/homepage/section/template-interface";
interface IHomepageData {
    description: string;
    title: string;
    about: string[];
    sections: ISection[];
}
export type { IHomepageData };
